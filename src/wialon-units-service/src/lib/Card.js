import db from "@lib/db";
import Unit from "./Unit";
import { requestToWialon, findUserRoleAndCheckAccess } from "@lib/utils";

async function attachCardToUnit(requestData, realm, userId) {
  requestData.card_number = requestData.card_number.trim();

  const wialonAccount = await Unit.getWialonAccount(
    userId,
    requestData.wialon_account_id
  );

  const { eid: sid } = await Unit.wialonLogin(
    wialonAccount.wialon_hosting_url,
    wialonAccount.wialon_token
  );

  const { user } = await findUserRoleAndCheckAccess(userId, false);

  const organization_aggregator_account = await db.organization_aggregator_accounts.findByPk(
    requestData.organization_aggregator_account_id,
    {
      attributes: ["id", "aggregator_id"],
      include: [
        { model: db.aggregator, attributes: ["name_for_custom_field"] }
      ],
      raw: true
    }
  );

  if (!organization_aggregator_account) {
    throw "ORGANIZATIONACCOUNTAGGREGATORNOTFOUND";
  }

  await _checkOnUniqueCard(
    requestData,
    organization_aggregator_account,
    sid,
    wialonAccount.wialon_hosting_url,
    false
  );

  const card = await db.card.findOne({
    where: {
      card_number: requestData.card_number,
      removed: 0
    }
  });
  let cardId = null;
  if (!card) {
    const cardCreate = await db.card.create({
      card_number: requestData.card_number,
      organization_id: user.organization_id,
      ctime: new Date(),
      mtime: new Date(),
      maker: userId,
      removed: 0,
      unit_id: requestData.unit_id,
      organization_aggregator_account_id:
        requestData.organization_aggregator_account_id
    });
    cardId = cardCreate.id;
  } else {
    cardId = card.id;
    card.mtime = new Date();
    card.unit_id = requestData.unit_id;
    card.organization_aggregator_account_id =
      requestData.organization_aggregator_account_id;
    await card.save();
  }

  const paramsForAdd = {
    itemId: requestData.unit_id,
    callMode: "create",
    n: organization_aggregator_account["aggregator.name_for_custom_field"],
    v: requestData.card_number,
    id: 0
  };

  await requestToWialon({
    sid,
    params: paramsForAdd,
    svc: "item/update_custom_field",
    host: wialonAccount.wialon_hosting_url
  });

  return { success: true, card_id: cardId };
}

async function updateCard(requestData, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId, false);

  const organization_aggregator_account = await db.organization_aggregator_accounts.findByPk(
    requestData.organization_aggregator_account_id,
    {
      attributes: ["id", "aggregator_id"],
      include: [
        { model: db.aggregator, attributes: ["name_for_custom_field"] }
      ],
      raw: true
    }
  );

  if (!organization_aggregator_account) {
    throw "ORGANIZATIONACCOUNTAGGREGATORNOTFOUND";
  }

  // await _checkOnUniqueCard(
  //   requestData,
  //   organization_aggregator_account,
  //   sid,
  //   wialonAccount.wialon_hosting_url,
  //   false
  // );

  let cardToResponse = null;
  if (requestData.id) {
    const card = await db.card.findOne({
      where: {
        id: requestData.id,
        organization_id: user.organization_id
      }
    });
    if (!!card) {
      card.organization_aggregator_account_id =
        requestData.organization_aggregator_account_id;
      card.save();
      cardToResponse = card;
    } else {
      throw "CARDNOTFOUND";
    }
  } else {
    const cardWithSameNumberAndAggregator = await db.card.findOne({
      attributes: ["id"],
      where: {
        card_number: requestData.card_number,
        organization_aggregator_account_id:
          requestData.organization_aggregator_account_id
      },
      raw: true
    });

    if (!!cardWithSameNumberAndAggregator) {
      throw "CARDTOCREATEALREADYEXIST";
    }

    const createdCard = await db.card.create({
      card_number: requestData.card_number,
      organization_id: user.organization_id,
      maker: userId,
      removed: 0,
      unit_id: requestData.unit_id,
      organization_aggregator_account_id:
        requestData.organization_aggregator_account_id
    });
    cardToResponse = createdCard;
  }

  return { success: true, card: cardToResponse.dataValues };
}

async function detachCardFromUnit(requestData, realm, userId) {
  requestData.card_number = requestData.card_number.trim();

  const wialonAccount = await Unit.getWialonAccount(
    userId,
    requestData.wialon_account_id
  );

  const { eid: sid } = await Unit.wialonLogin(
    wialonAccount.wialon_hosting_url,
    wialonAccount.wialon_token
  );

  const { user } = await findUserRoleAndCheckAccess(userId, false);
  const paramsToDelete = {
    itemId: requestData.unit_id,
    callMode: "delete",
    id: requestData.id_field //id_field
  };

  await requestToWialon({
    sid,
    params: paramsToDelete,
    svc: "item/update_custom_field",
    host: wialonAccount.wialon_hosting_url
  });

  let deleted_card_id = null;
  if (!!requestData.card_id) {
    const card = await db.card.findOne({
      attributes: ["id"],
      raw: true,
      where: {
        id: requestData.card_id,
        organization_id: user.organization_id
      }
    });
    if (card) {
      deleted_card_id = card.id;
      await db.card.destroy({
        where: {
          id: card.id
        }
      });
    }
  }

  return { success: true, deleted_card_id };
}

async function _checkOnUniqueCard(
  requestData,
  organization_aggregator_account,
  sid,
  wialon_hosting_url,
  skipValueFlag = false
) {
  const paramsForCheck = {
    id: requestData.unit_id,
    flags: 9
  };
  const itemObject = await requestToWialon({
    sid,
    params: paramsForCheck,
    svc: "core/search_item",
    host: wialon_hosting_url
  });

  await _checkItem(
    itemObject,
    requestData,
    organization_aggregator_account["aggregator.name_for_custom_field"],
    skipValueFlag
  );

  return true;
}

async function _checkItem(
  itemObject,
  requestData,
  name_for_custom_field,
  skipValue = false
) {
  for (const [key, value] of Object.entries(itemObject.item.flds)) {
    if (value && value.n == name_for_custom_field) {
      throw "CARTWITHTHISAGGREGATORALREADYEXIST";
    }
    if (value && value.v == requestData.card_number && !skipValue) {
      throw "CARTWITHTHISNUMBERALREADYEXIST";
    }
  }
  return;
}

async function getCards(requestData, realm, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId, false);
  let aggregators = await Unit.getAggregators(user.organization_id);

  let { items } = await Unit.getUnits({ start: 0, end: 0 }, realm, userId);

  if (!items.length) {
    return { items: [], success: true };
  }
  const namesForCustomField = aggregators.map((el) => el.name_for_custom_field);
  items = items.filter((el) => el.flds.length);

  let onlyCards = [];
  for (const item of items) {
    const cards = item.flds;
    if (!cards.length) {
      continue;
    }
    for (const card of cards) {
      if (
        (!requestData.card_number ||
          card.v.includes(requestData.card_number)) &&
        onlyCards.indexOf(card.v) === -1 &&
        namesForCustomField.includes(card.n)
      ) {
        onlyCards.push(card.v);
      }
    }
  }

  return { success: true, items: onlyCards };
}
export default {
  attachCardToUnit,
  detachCardFromUnit,
  getCards,
  updateCard
};
