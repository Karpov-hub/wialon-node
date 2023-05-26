import axios from "axios";
import db from "@lib/db";
import {
  CONSTANTS,
  equalsIgnoringCase,
  requestToWialon,
  handleWialonResponse,
  findUserRoleAndCheckAccess
} from "@lib/utils";

const Op = db.Sequelize.Op;

async function wialonLogin(wialonHostingUrl, wialonToken) {
  const params = {
    token: wialonToken,
    fl: 35 //basic, user and property info
  };

  return await requestToWialon({
    params,
    svc: "token/login",
    host: wialonHostingUrl
  });
}
async function getWialonAccount(userId, wialonAccountId) {
  const { user } = await findUserRoleAndCheckAccess(userId, false);
  //TODO wialon access for user
  const wialonAccount = await db.wialon_accounts.findOne({
    where: {
      id: wialonAccountId,
      organization_id: user.organization_id,
      removed: 0
    },
    raw: true
  });
  if (!wialonAccount) {
    throw "ACCESSDENIED";
  }

  return wialonAccount;
}

async function getValidWialonAccounts(
  { organization_id, role },
  userId = false
) {
  const whereQuery = {
    organization_id,
    removed: 0,
    wialon_token: { [Op.ne]: null }
  };

  if (userId && equalsIgnoringCase(role, CONSTANTS.ROLE_USER)) {
    const wialonAccountAccesses = await db.wialon_account_accesses.findAll({
      where: {
        user_id: userId
      },
      attributes: ["wialon_acc_id"],
      raw: true
    });
    const allowedWialonAccIds = wialonAccountAccesses.map(
      (el) => el.wialon_acc_id
    );
    whereQuery.id = allowedWialonAccIds;
  }
  return await db.wialon_accounts.findAll({
    where: whereQuery,
    attributes: ["id", "wialon_hosting_url", "wialon_token", "wialon_username"],
    raw: true
  });
}

async function getAggregators(organizationId) {
  const allowedAggregators = await db.organization_aggregator_account_permissions.findAll(
    {
      where: {
        organization_id: organizationId,
        removed: 0
      },
      raw: true
    }
  );

  if (!allowedAggregators.length) {
    throw "NOAVAILABLEAGGREGATORS";
  }
  const allowedAggregatorIds = allowedAggregators.map((el) => el.aggregator_id);

  const aggregators = await db.aggregator.findAll({
    where: {
      removed: 0
    },
    raw: true
  });

  for (const aggregator of aggregators) {
    aggregator.is_organization_has_access = !!allowedAggregatorIds.includes(
      aggregator.id
    );
  }
  return aggregators;
}

function filterByUniqueId(list) {
  return list.reduce(
    (acc, unit) => {
      if (acc.map[unit.id])
        // если данный unit уже был
        return acc; // ничего не делаем, возвращаем уже собранное

      acc.map[unit.id] = true; // помечаем unit, как обработанный
      acc.units.push(unit); // добавляем объект в массив units
      return acc; // возвращаем собранное
    },
    {
      map: {},
      units: []
    }
  ).units;
}

async function getUnits(requestData, realm, userId) {
  const { start = 0, end = 0, descending = false } = requestData;
  const { user, role } = await findUserRoleAndCheckAccess(userId, false);
  const aggregators = await getAggregators(user.organization_id);
  const cardsInTheSystem = await db.card.findAll({
    attributes: [
      "id",
      "card_number",
      "ctime",
      "organization_aggregator_account_id"
    ],
    raw: true,
    where: {
      organization_id: user.organization_id,
      removed: 0
    },
    include: [
      { model: db.organization_aggregator_accounts, attributes: ["id", "name"] }
    ]
  });

  const wialonAccounts = await getValidWialonAccounts(
    {
      role: role.role,
      organization_id: user.organization_id
    },
    userId
  );
  const namesForCustomFields = aggregators.map(
    (el) => el.name_for_custom_field
  );

  const params = {
    spec: {
      itemsType: "avl_unit",
      propName: "sys_name",
      propValueMask: requestData.filter_by_name
        ? `*${requestData.filter_by_name}*`
        : "*",
      sortType: descending ? "!sys_name" : "sys_name"
    },
    force: 0,
    flags: 9,
    from: start,
    to: end
  };

  let unitsList = await Promise.all(
    wialonAccounts.map(async (acc) => {
      const { eid: sid } = await wialonLogin(
        acc.wialon_hosting_url,
        acc.wialon_token
      );
      let data = await requestToWialon({
        sid,
        params,
        svc: "core/search_items",
        host: acc.wialon_hosting_url
      });
      for (let item of data.items) {
        item.wialon_account_id = acc.id;
        item.wialon_account_name = acc.wialon_username;
        const listOfCards = [];
        const cards = Object.entries(item.flds);
        for (const card of cards) {
          card[1].is_organization_has_access = !!namesForCustomFields.includes(
            card[1].n
          );
          listOfCards.push(card[1]);
        }
        item.flds = listOfCards;
      }
      return data.items;
    })
  ).catch((e) => {
    throw e;
  });

  unitsList = unitsList.flat();
  if (wialonAccounts.length > 1) {
    unitsList = filterByUniqueId(unitsList);
  }

  const data = {
    totalItemsCount: unitsList.length,
    items: unitsList
  };

  if (requestData && requestData.filter_by_card && data.items.length) {
    let filteredItems = [];
    for (const item of data.items) {
      for (const card of item.flds) {
        if (
          card.v.includes(requestData.filter_by_card) &&
          namesForCustomFields.includes(card.n)
        ) {
          filteredItems.push(item);
        }
      }
    }
    data.items = filteredItems;
  }

  try {
    for (let i = 0; i < data.items.length; i++) {
      const keysOfFlds = Object.keys(data.items[i].flds);
      for (const aggregator of aggregators) {
        for (let j = 0; j < keysOfFlds.length; j++) {
          if (
            data.items[i].flds[keysOfFlds[j]].n ==
            aggregator.name_for_custom_field
          ) {
            data.items[i].flds[keysOfFlds[j]].wialon_ctime =
              data.items[i].flds[keysOfFlds[j]].ct;
            data.items[i].flds[keysOfFlds[j]].repogen_ctime = null;
            delete data.items[i].flds[keysOfFlds[j]].ct;
            data.items[i].flds[keysOfFlds[j]].aggregator_name = aggregator.name;
            data.items[i].flds[
              keysOfFlds[j]
            ].organization_aggregator_account_id = null;
            data.items[i].flds[
              keysOfFlds[j]
            ].organization_aggregator_account_name = null;
            data.items[i].flds[keysOfFlds[j]].repogen_card_id = null;
            data.items[i].flds[keysOfFlds[j]].aggregator_id = aggregator.id;
            const cardRecordOfRepogen = cardsInTheSystem.find(
              (el) => el.card_number == data.items[i].flds[keysOfFlds[j]].v
            );
            if (!!cardRecordOfRepogen) {
              data.items[i].flds[keysOfFlds[j]].repogen_ctime = parseInt(
                Date.parse(cardRecordOfRepogen.ctime) / 1000,
                10
              );
              data.items[i].flds[
                keysOfFlds[j]
              ].organization_aggregator_account_id =
                cardRecordOfRepogen.organization_aggregator_account_id;
              data.items[i].flds[
                keysOfFlds[j]
              ].organization_aggregator_account_name = cardRecordOfRepogen.name;
              data.items[i].flds[keysOfFlds[j]].repogen_card_id =
                cardRecordOfRepogen.id;
            }
          }
        }
      }
      data.items[i].flds = data.items[i].flds.filter(
        (customField) => customField.aggregator_name
      );
    }
  } catch (e) {
    return { ...data, success: false };
  }
  return { ...data, success: true };
}

async function getGroups(requestData, realm, userId) {
  const { user, role } = await findUserRoleAndCheckAccess(userId, false);
  const wialonAccounts = await getValidWialonAccounts(
    { role: role.role, organization_id: user.organization_id },
    userId
  );
  wialonAccounts[1] = wialonAccounts[0];
  const params = {
    spec: {
      itemsType: "avl_unit_group",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name"
    },
    force: 0,
    flags: 1,
    from: 0,
    to: 0
  };
  let groupsList = await Promise.all(
    wialonAccounts.map(async (acc) => {
      const { eid: sid } = await wialonLogin(
        acc.wialon_hosting_url,
        acc.wialon_token
      );
      const data = await requestToWialon({
        sid,
        params,
        svc: "core/search_items",
        host: acc.wialon_hosting_url
      });
      return data.items;
    })
  ).catch((e) => {
    throw e;
  });

  groupsList = groupsList.flat();
  if (wialonAccounts.length > 1) {
    groupsList = filterByUniqueId(groupsList);
  }

  return {
    totalItemsCount: groupsList.length,
    items: groupsList,
    success: true
  };
}

async function getWialonProfile(data, realm, user) {
  try {
    const FormData = require("form-data");
    let requestData = new FormData();
    requestData.append(
      "params",
      '{"operateAs":"","continueCurrentSession":true,"checkService":"hosting","restore":1,"appName":"web/hosting.wialon.com","webSite":1}'
    );
    requestData.append("sid", data.sid);

    const config = {
      method: "post",
      url: `${data.host}/wialon/ajax.html?svc=core/duplicate&sid=${data.sid}`,
      headers: {
        ...requestData.getHeaders()
      },
      data: requestData
    };

    const { data: wialonProfile } = await axios(config);

    await handleWialonResponse(wialonProfile);

    return wialonProfile.user;
  } catch (e) {
    throw e;
  }
}

export default {
  getAggregators,
  getGroups,
  getUnits,
  getWialonProfile,
  getWialonAccount,
  wialonLogin
};
