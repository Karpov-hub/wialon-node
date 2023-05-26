import db from "@lib/db";
import { CONSTANTS, equalsIgnoringCase, uniqueArray } from "./Global";
import wialon from "wialon";
import User from "./User";

const Op = db.Sequelize.Op;

async function getAccessibleWialonAccounts(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;

  const user = await db.user.findOne({
    where: { id: userId }
  });

  const role = await db.role.findOne({
    where: { id: user.dataValues.role_id }
  });

  let res;
  //Access denied for normal users
  if (equalsIgnoringCase(role.dataValues.role, CONSTANTS.ROLE_USER)) {
    await db.wialon_account_accesses.belongsTo(db.wialon_accounts, {
      targetKey: "id",
      foreignKey: "wialon_acc_id"
    });
    let { count, rows } = await db.wialon_account_accesses.findAndCountAll({
      // include: [{
      //    model: db.wialon_accounts
      // }],
      attributes: [
        "wialon_acc_id",
        [
          db.sequelize.literal(
            '(SELECT organization_id FROM wialon_accounts where id="wialon_acc_id")'
          ),
          "organization_id"
        ],
        [
          db.sequelize.literal(
            '(SELECT wialon_username FROM wialon_accounts where id="wialon_acc_id")'
          ),
          "wialon_username"
        ]
      ],
      where: { user_id: userId },
      offset,
      limit
    });
    res = { count, rows };
  } else {
    let { count, rows } = await db.wialon_accounts.findAndCountAll({
      attributes: [
        ["id", "wialon_acc_id"],
        "organization_id",
        "wialon_username"
      ],
      where: {
        organization_id: user.dataValues.organization_id
      },
      offset,
      limit,
      order: [["mtime", "DESC"]]
    });
    res = { count, rows };
  }
  return { success: true, res: res.rows, count: res.count, offset, limit };
}

async function setAccountsAccess(data, realmId, userId) {
  const { user } = await User.findUserRoleAndCheckAccess(userId);
  let values;
  if (data.accountsId.length) {
    let newArray = uniqueArray(data.accountsId);

    values = [];
    for (let i = 0; i < newArray.length; i++) {
      if (await checkAccountNotExist(newArray[i], user.organization_id))
        throw "EXTERNALACCOUNTNOTFOUND";

      let value = {
        user_id: data.userId,
        wialon_acc_id: newArray[i],
        ctime: new Date(),
        mtime: new Date(),
        stime: null,
        signobject: null,
        removed: null,
        maker: null
      };
      values[i] = value;
    }
  }

  let res;

  await db.wialon_account_accesses.destroy({
    where: {
      user_id: data.userId
    }
  });
  if (values && values.length) {
    const lastNumber = await db.wialon_account_accesses.findOne({
      attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
      raw: true
    });

    let id = Number(lastNumber.max) + 1;

    for (let i = 0; i < values.length; i++) {
      id++;
      values[i].id = id;
    }

    // for (let i = 0; i < values.length; i++) {
    res = await db.wialon_account_accesses.bulkCreate(values);
    // }
  } else {
    res = [];
  }
  return { success: true, res };
}

async function checkAccountNotExist(wialon_acc_id, org_id) {
  const account = await db.wialon_accounts.findOne({
    where: {
      id: wialon_acc_id,
      organization_id: org_id
    }
  });

  return account == null;
}

async function listUserWialonAccounts(data, realmId, userId) {
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let { count, rows } = await db.wialon_accounts.findAndCountAll({
    attributes: [
      "id",
      "wialon_username",
      "wialon_token",
      "wialon_hosting_url",
      [
        db.sequelize.literal(
          `(SELECT COUNT(*)>0 FROM "wialon_account_accesses" where "wialon_account_accesses"."user_id"='${data.userId}' AND "wialon_account_accesses"."wialon_acc_id"="wialon_accounts"."id")`
        ),
        "is_access"
      ]
    ],
    where: {
      organization_id: user.organization_id
    },
    order: [["mtime", "DESC"]]
  });

  return { success: true, res: rows, count };
}

async function listWialonAccounts(data, realmId, userId) {
  const { start: offset, limit } = data;

  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let { count, rows } = await db.wialon_accounts.findAndCountAll({
    where: {
      organization_id: user.organization_id
    },
    order: [["ctime", "DESC"]],
    offset,
    limit
  });

  return { success: true, res: rows, count, offset, limit };
}

async function listWialonAccountsForUser(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;

  const accessOfUser = await db.wialon_account_accesses.findAll({
    where: {
      user_id: userId
    },
    attributes: ["wialon_acc_id"],
    raw: true
  });

  if (accessOfUser && !accessOfUser.length) return { success: true, res: [] };

  const accessOfUserIds = accessOfUser.map((el) => el.wialon_acc_id);

  let { count, rows } = await db.wialon_accounts.findAndCountAll({
    where: {
      id: accessOfUserIds
    },
    offset,
    limit,
    attributes: ["id", "wialon_username", "wialon_hosting_url"],
    raw: true,
    order: [["id", "ASC"]]
  });
  return { success: true, res: rows, count, offset, limit };
}

async function removeWialonAccount(data, realmId, userId) {
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let res;
  res = await db.wialon_accounts.destroy({
    where: {
      id: data.wialon_acc_id,
      organization_id: user.organization_id
    }
  });

  if (res == 0) throw "RECORDNOTFOUND";

  return { success: true, res };
}

async function addWialonAccount(data, realmId, userId) {
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  if (
    data.wialon_token &&
    !(await checkUniqueToken(user.organization_id, data.wialon_token))
  )
    throw "TOKENEXISTS";

  if (!data.is_test) {
    await _checkWialonData(data);
  }

  let res;
  data.organization_id = user.organization_id;
  let { max } = await db.wialon_accounts.findOne({
    attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
    raw: true
  });
  data.id = max + 1;
  res = await db.wialon_accounts.create(data);

  return { success: true, res };
}

async function updateWialonAccount(data, realmId, userId) {
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let wialonAccount = await db.wialon_accounts.findByPk(data.wialonAccId);

  if (
    data.wialon_token &&
    !(data.wialon_token == wialonAccount.wialon_token) &&
    !(await checkUniqueToken(user.organization_id, data.wialon_token))
  )
    throw "TOKENEXISTS";

  if (!data.is_test) {
    await _checkWialonData(data);
  }

  let res;

  try {
    if (data.wialon_username) {
      wialonAccount.wialon_username = data.wialon_username;
    }
    if (data.wialon_token || data.wialon_token === null) {
      wialonAccount.wialon_token = data.wialon_token;
    }
    if (data.wialon_hosting_url) {
      wialonAccount.wialon_hosting_url = data.wialon_hosting_url;
    }
    res = await wialonAccount.save();
  } catch (e) {
    console.log("auth-service, updateWialonAccount, error: ", e);
    throw "TIMEOUTOFCHECKWIALONACCOUNT";
  }
  return { success: true, res };
}

async function checkUniqueToken(organization_id, wialon_token) {
  const res = await db.wialon_accounts.findOne({
    where: {
      wialon_token: wialon_token,
      organization_id: organization_id
    }
  });
  return !res;
}

async function _checkWialonData(data) {
  if (!data.wialon_token) return;

  const url = data.wialon_hosting_url + "/wialon/ajax.html";

  const session = wialon({
    url
  }).session;

  await _login(data.wialon_token, session);

  await _checkPermissionOfWialonAccount(session);
}

async function _checkPermissionOfWialonAccount(session) {
  const error_messages = {
    "Error: API error: 7": "NOACCESSTODOREQUESTFORCHECK",
    NOACCESSTOCREATEREPORT: "NOACCESSTOCREATEREPORT"
  };

  const paramsForGetAccountInfo = {
    itemId: session._session.user.bact,
    type: 4
  };
  try {
    const accountInfo = await session.request(
      "account/get_account_data",
      paramsForGetAccountInfo
    );
    if (accountInfo && accountInfo.services) {
      if (!accountInfo.services.avl_unit) {
        throw "NOTCONNECTEDUNITSERVICE";
      }
      if (!accountInfo.services.avl_unit_group) {
        throw "NOTCONNECTEDUNITGROUPSERVICE";
      }
      if (!accountInfo.services.reporttemplates) {
        throw "NOTCONNECTEDREPORTTEMPLATESSERVICE";
      }
    }

    const paramsForGetBillingInfo = {
      items: [session._session.user.bact],
      accessFlags: 536870912,
      serviceName: "reporttemplates"
    };

    const billingInfo = await session.request(
      "core/check_items_billing",
      paramsForGetBillingInfo
    );
    if (!billingInfo || !billingInfo.length) {
      throw "NOACCESSTOCREATEREPORT";
    }
  } catch (e) {
    throw error_messages[e] || "TIMEOUTOFCHECKWIALONACCOUNT";
  }
}

function _login(token, session) {
  return new Promise(async (resolve, reject) => {
    await session
      .start({
        token
      })
      .then(async (data) => {
        resolve(data);
      })
      .catch((err) => {
        const error_messages = {
          "API error: 4": "INVALIDTOKEN",
          "API error: 8": "EXPIREDTOKEN"
        };
        if (!!error_messages[err.message]) reject(error_messages[err.message]);

        if (
          err.message.includes("getaddrinfo ENOTFOUND") ||
          err.message.includes("Invalid URI") ||
          err.message.includes("Unexpected token") ||
          JSON.stringify(err) === "{}"
        )
          reject("INVALIDURLHOSTING");

        reject("TIMEOUTOFCHECKWIALONACCOUNT");
      });
  });
}

async function listWialonAccountsToGenerateReport(data, realmId, userId) {
  const { start: offset, limit } = data;

  const user = await db.user.findOne({
    where: { id: userId, realm: realmId },
    raw: true
  });
  const role = await db.role.findOne({
    where: { id: user.role_id },
    raw: true
  });
  if (
    equalsIgnoringCase(role.role, CONSTANTS.ROLE_ADMIN) ||
    equalsIgnoringCase(role.role, CONSTANTS.ROLE_SUPER_ADMIN)
  ) {
    const { count, rows } = await db.wialon_accounts.findAndCountAll({
      where: {
        organization_id: user.organization_id,
        wialon_token: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }]
        }
      },
      raw: true,
      offset,
      limit,
      attributes: [
        "id",
        "organization_id",
        "wialon_username",
        "wialon_hosting_url",
        "ctime"
      ],
      order: [["ctime", "DESC"]]
    });
    return { success: true, res: rows, count, offset, limit };
  } else {
    const wialonAccountAccesses = await db.wialon_account_accesses.findAll({
      where: {
        user_id: userId
      },
      raw: true
    });

    if (!wialonAccountAccesses.length) {
      return { success: true, res: [] };
    } else {
      const wialonAccountIds = wialonAccountAccesses.map(
        (el) => el.wialon_acc_id
      );
      const { count, rows } = await db.wialon_accounts.findAndCountAll({
        where: {
          id: {
            [Op.in]: wialonAccountIds
          },
          wialon_token: {
            [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }]
          }
        },
        offset,
        limit,
        raw: true,
        attributes: [
          "id",
          "organization_id",
          "wialon_username",
          "wialon_hosting_url",
          "ctime"
        ],
        order: [["ctime", "DESC"]]
      });
      return { success: true, res: rows, count, offset, limit };
    }
  }
}

export default {
  addWialonAccount,
  updateWialonAccount,
  removeWialonAccount,
  listWialonAccounts,
  listWialonAccountsForUser,
  listUserWialonAccounts,
  setAccountsAccess,
  getAccessibleWialonAccounts,
  listWialonAccountsToGenerateReport
};
