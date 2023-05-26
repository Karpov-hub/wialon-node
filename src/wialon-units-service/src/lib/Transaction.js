import Queue from "@lib/queue";
import db from "@lib/db";
import Unit from "./Unit";
import {
  CONSTANTS,
  requestToWialon,
  removeTimezoneOffset,
  findUserRoleAndCheckAccess
} from "@lib/utils";

const Op = db.Sequelize.Op;

/**
 *
 * @param {object} requestData
 * @param {number} requestData.start_date - UNIX time for start date of select transaction
 * @param {number} requestData.end_date - UNIX time for start date of select transaction
 * @param {number} requestData.unit_id - Id of unit to add fuel event
 * @param {string} requestData.aggregator_id - Id of aggregator for search transactions
 * @param {string} requestData.card_number - Card number
 * @param {string} requestData.wialon_account_id - Id of wialon account
 * @param {string} realmId
 * @param {string} userId
 * @
 * @returns {object}
 */
async function uploadTransactionsForOneUnit(requestData, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId, false);
  const wialonAccount = await Unit.getWialonAccount(
    userId,
    requestData.wialon_account_id
  );

  const { eid: sid, user: wialonProfile } = await Unit.wialonLogin(
    wialonAccount.wialon_hosting_url,
    wialonAccount.wialon_token
  );

  const tz =
    wialonProfile.prp.tz < 0
      ? (wialonProfile.prp.tz & 0xffff) | 0xffff0000
      : wialonProfile.prp.tz & 0xffff;
  let start_date, end_date;
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "localtest"
  ) {
    start_date = requestData.start_date;
    end_date = requestData.end_date;
  } else {
    start_date = removeTimezoneOffset(
      requestData.start_date,
      wialonProfile.prp.tz
    );
    end_date = removeTimezoneOffset(requestData.end_date, wialonProfile.prp.tz);
  }

  // Получить данные агрегатора для использования апи
  const card = await db.card.findByPk(requestData.card_id, {
    raw: true
  });

  if (!card) {
    throw "CARDNOTFOUND";
  }

  const organizationAggregatorAccountRaw = await db.organization_aggregator_accounts.findByPk(
    card.organization_aggregator_account_id,
    {
      attributes: [
        "api_key",
        "login",
        "password",
        "contract_number",
        "aggregator_id"
      ],
      include: [{ model: db.aggregator }]
    }
  );

  const organizationAggregatorAccount =
    organizationAggregatorAccountRaw.dataValues;

  const aggregator = organizationAggregatorAccount.aggregator.dataValues;

  // Получить пропарсенные транзакции с агрегатора

  let { error = null, result: transactions = null } = await Queue.newJob(
    aggregator.service_for_method,
    {
      method: aggregator.method_for_get_data,
      data: {
        start_date: start_date * 1000,
        end_date: end_date * 1000,
        aggregator,
        tz,
        params: {
          api_key: organizationAggregatorAccount.api_key,
          login: organizationAggregatorAccount.login,
          password: organizationAggregatorAccount.password,
          contract_number: organizationAggregatorAccount.contract_number
        }
      }
    }
  );
  if (!!error) {
    throw error;
  }
  if (transactions && transactions.length === 0) {
    throw "NOTFOUNDTRANSACTIONSTOUPLOAD";
  }

  const paramsForUnits = {
    sid,
    start: 0,
    end: 0,
    descending: true
  };
  // Получение юнитов
  let { items: units } = await Unit.getUnits(paramsForUnits, realmId, userId);

  if (!units.length) {
    throw "NOONEUNITS";
  }

  const isUnitExist = units.find((el) => el.id == card.unit_id);
  if (!isUnitExist) {
    throw "UNITNOTEXIST";
  }
  // Получение транз из виалона
  await requestToWialon({
    sid,
    params: {},
    svc: "messages/unload",
    host: wialonAccount.wialon_hosting_url
  });

  const paramsForGetMessages = {
    itemId: card.unit_id,
    timeFrom: start_date,
    timeTo: end_date,
    flags: 1536,
    flagsMask: 65280,
    loadCount: 4294967295
  };

  const { messages } = await requestToWialon({
    sid,
    params: paramsForGetMessages,
    svc: "messages/load_interval",
    host: wialonAccount.wialon_hosting_url
  });

  const duplicates = [];

  for (const tx of transactions) {
    for (const message of messages) {
      const splitedMessages = message.et.split(";");
      if (splitedMessages.includes(`Transaction ID:${tx.id}`)) {
        duplicates.push(tx);
      }
    }
  }

  transactions = transactions.filter(function(val) {
    return duplicates.indexOf(val) == -1;
  });

  let countUploadedTransactions = 0;
  // Загрузить данные на виалон
  for (const transaction of transactions) {
    if (String(card.card_number) == String(transaction.id_card)) {
      await _registrationFuelFilling({
        itemForRequest: {
          date: removeTimezoneOffset(transaction.date, 0),
          volume: transaction.volume,
          cost: transaction.cost,
          location: transaction.location,
          deviation: transaction.deviation,
          x: transaction.x,
          y: transaction.y,
          description: transaction.description,
          itemId: card.unit_id
        },
        sid,
        host: wialonAccount.wialon_hosting_url
      });
      countUploadedTransactions++;
    } else {
      continue;
    }
  }
  // Выход

  return {
    success: true,
    countUploadedTransactions
  };
}

async function deleteUnitTransactionsByCard(requestData, realmId, userId) {
  const wialonAccount = await Unit.getWialonAccount(
    userId,
    requestData.wialon_account_id
  );

  const { eid: sid, user: wialonProfile } = await Unit.wialonLogin(
    wialonAccount.wialon_hosting_url,
    wialonAccount.wialon_token
  );

  await requestToWialon({
    sid,
    params: {},
    svc: "messages/unload",
    host: wialonAccount.wialon_hosting_url
  });

  const tz = wialonProfile.prp.tz;
  let startDate, endDate;
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "localtest"
  ) {
    startDate = requestData.start_date;
    endDate = requestData.end_date;
  } else {
    startDate = removeTimezoneOffset(requestData.start_date, tz);
    endDate = removeTimezoneOffset(requestData.end_date, tz);
  }
  const paramsForGetMessages = {
    itemId: requestData.unit_id,
    timeFrom: startDate,
    timeTo: endDate,
    flags: 1536,
    flagsMask: 65280,
    loadCount: 4294967295
  };

  const messages = await requestToWialon({
    sid,
    params: paramsForGetMessages,
    svc: "messages/load_interval",
    host: wialonAccount.wialon_hosting_url
  });

  let paramsForDelete = {
    msgIndex: 0
  };
  if (messages.count == 0) {
    throw "NOONETRANSACTIONTODELETE";
  }

  while (paramsForDelete.msgIndex < messages.count) {
    await requestToWialon({
      sid,
      params: paramsForDelete,
      svc: "messages/delete_message",
      host: wialonAccount.wialon_hosting_url
    });
    paramsForDelete.msgIndex++;
  }

  return { success: true, countDeletedTransactions: paramsForDelete.msgIndex };
}

async function uploadTransactions() {
  const startDateCron = new Date();
  let globalCounterToUploaded = 0;
  const organization_plugins = await db.organization_plugin.findAll({
    where: {
      plugin_id: CONSTANTS.PLUGIN_FUEL_CARDS_ID,
      status: 2, // status approved
      is_cron_enabled: true,
      removed: 0
    },
    raw: true
  });
  if (!organization_plugins.length) {
    console.info(
      "Not found organizations with enabled CRON to daily uploading of the FUC transactions to Wialon Hosting."
    );
    return { success: true };
  }

  let organizationIds = organization_plugins.map((el) => el.organization_id);
  organizationIds = [...new Set(organizationIds)]; // delete duplicates

  const wialon_accounts = await db.wialon_accounts.findAll({
    attributes: [
      "id",
      "wialon_username",
      "wialon_token",
      "wialon_hosting_url",
      "organization_id"
    ],
    raw: true,
    where: {
      organization_id: organizationIds,
      wialon_token: {
        [Op.ne]: null
      },
      removed: 0
    }
  });

  if (!wialon_accounts.length) {
    console.info(
      "Not found Wialon accounts of organizations with valid token to daily upload FUC transactions to Wialon Hosting"
    );
  }

  const cards = await db.card.findAll({
    where: {
      removed: 0,
      organization_id: {
        [Op.in]: organizationIds
      }
    },
    raw: true
  });

  if (!cards.length) {
    console.info(
      "Not found attached cards to daily uploading of the FUC transactions to Wialon Hosting"
    );
    return { success: true };
  }

  const aggregators = await db.aggregator.findAll({
    where: {
      removed: 0
    },
    raw: true
  });

  let allOfTransactions = [];

  const organization_aggregator_accounts = await db.organization_aggregator_accounts.findAll(
    {
      where: {
        removed: 0,
        organization_id: {
          [Op.in]: organizationIds
        }
      },
      raw: true
    }
  );

  let start_date, end_date;
  let currentOrganization = null,
    currentOrganizationId = null,
    currentUnit = null;
  for (const wialon_account of wialon_accounts) {
    const { user: wialonProfile } = await Unit.wialonLogin(
      wialon_account.wialon_hosting_url,
      wialon_account.wialon_token
    );

    const filteredOrganizationAggregatorAccounts = organization_aggregator_accounts.filter(
      (orgAggAcc) =>
        orgAggAcc.organization_id === wialon_account.organization_id
    );
    for (const organization_aggregator_account of filteredOrganizationAggregatorAccounts) {
      try {
        start_date = new Date();
        end_date = new Date();

        start_date.setDate(start_date.getDate() - 1);

        end_date.setDate(end_date.getDate() - 1);
        currentOrganizationId = organization_aggregator_account.organization_id;

        const aggregator = aggregators.find(
          (el) => el.id == organization_aggregator_account.aggregator_id
        );
        if (!aggregator) continue;

        start_date.setHours(0);
        start_date.setMinutes(0);
        start_date.setSeconds(0);
        start_date.setMilliseconds(0);
        end_date.setHours(23);
        end_date.setMinutes(59);
        end_date.setSeconds(59);
        end_date.setMilliseconds(0);

        const tzOffset = new Date().getTimezoneOffset() * 60 * 1000;

        start_date = start_date.getTime() - tzOffset;
        end_date = end_date.getTime() - tzOffset;

        const tz =
          wialonProfile.prp.tz < 0
            ? (wialonProfile.prp.tz & 0xffff) | 0xffff0000
            : wialonProfile.prp.tz & 0xffff;
        const { result: objectToPush } = await Queue.newJob(
          aggregator.service_for_method,
          {
            method: aggregator.method_for_get_data,
            data: {
              start_date,
              end_date,
              aggregator,
              tz,
              params: {
                api_key: organization_aggregator_account.api_key,
                login: organization_aggregator_account.login,
                password: organization_aggregator_account.password,
                contract_number: organization_aggregator_account.contract_number
              }
            }
          }
        );
        allOfTransactions.push({
          transactions: objectToPush,
          organization_id: organization_aggregator_account.organization_id,
          aggregator_id: aggregator.id,
          name_for_custom_field: aggregator.name_for_custom_field
        });
      } catch (e) {
        console.error(e);
        await Queue.newJob("auth-service", {
          method: "insertLogs",
          data: {
            organization_id: currentOrganizationId,
            action: "CRON",
            message:
              "Error during performing CRON to upload the FUC transactions to the Wialon Hosting.",
            data: {
              error_message: e.message
            }
          }
        });
        continue;
      }
    }
  }

  currentOrganizationId = null;

  if (!organization_aggregator_accounts.length) {
    console.info(
      "Not found attached API-keys/login/password/files to aggregators for daily upload FUC transactions to Wialon Hosting."
    );
    return;
  }

  for (const wialon_account of wialon_accounts) {
    try {
      currentOrganization = wialon_account.organization_id;
      const { eid: sid, user: wialonProfile } = await Unit.wialonLogin(
        wialon_account.wialon_hosting_url,
        wialon_account.wialon_token
      );

      let allOfTransactionsForUser = allOfTransactions.filter(
        (el) => el.organization_id == wialon_account.organization_id
      );

      let { items: units } = await _getUnitsBySidAndWialonAccount({
        sid,
        wialon_account
      });

      if (!units.length) {
        console.info(
          `Not found vehicles of wialon account : ${wialon_account.username} and id ${wialon_account.id}`
        );
        continue;
      }

      units = units.filter((el) => Object.entries(el.flds).length > 0);
      let messages;
      for (const unit of units) {
        try {
          currentUnit = unit;
          // Получение транз из виалона
          const paramsForGetMessages = {
            itemId: unit.id,
            timeFrom: parseInt(start_date / 1000, 10),
            timeTo: parseInt(end_date / 1000, 10),
            flags: 1536,
            flagsMask: 65280,
            loadCount: 4294967295
          };

          await requestToWialon({
            sid,
            params: {},
            svc: "messages/unload",
            host: wialon_account.wialon_hosting_url
          });

          messages = await requestToWialon({
            sid,
            params: paramsForGetMessages,
            svc: "messages/load_interval",
            host: wialon_account.wialon_hosting_url
          });

          let duplicates = [];
          for (let transactions of allOfTransactionsForUser) {
            for (const tx of transactions.transactions) {
              for (const message of messages.messages) {
                const splitedMessages = message.et.split(";");
                if (splitedMessages.includes(`Transaction ID:${tx.id}`)) {
                  duplicates.push(tx);
                }
              }
              transactions.transactions = transactions.transactions.filter(
                function(val) {
                  return duplicates.indexOf(val) == -1;
                }
              );
            }
          }

          for (const card of unit.flds) {
            for (const transactionObject of allOfTransactionsForUser) {
              if (card.n == transactionObject.name_for_custom_field) {
                for (const transaction of transactionObject.transactions) {
                  if (card.v == transaction.id_card) {
                    await _registrationFuelFilling({
                      itemForRequest: {
                        date: parseInt(
                          removeTimezoneOffset(transaction.date, 0),
                          10
                        ),
                        volume: transaction.volume,
                        cost: transaction.cost,
                        location: transaction.location,
                        deviation: transaction.deviation,
                        x: transaction.x,
                        y: transaction.y,
                        description: transaction.description,
                        itemId: unit.id
                      },
                      sid
                    });

                    globalCounterToUploaded++;
                  }
                }
              }
            }
          }
        } catch (e) {
          await Queue.newJob("auth-service", {
            method: "insertLogs",
            data: {
              organization_id: currentOrganization.id,
              action: "CRON",
              message:
                "Error during performing CRON to upload the FUC transactions to the Wialon Hosting.",
              data: {
                error_message: e.message,
                currentUnit
              }
            }
          });
          continue;
        }
      }
      currentUnit = null;
    } catch (e) {
      await Queue.newJob("auth-service", {
        method: "insertLogs",
        data: {
          user_id: currentOrganization.id,
          action: "CRON",
          message:
            "Error during performing CRON to upload the FUC transactions to the Wialon Hosting.",
          data: {
            error_message: e.message
          }
        }
      });
      continue;
    }
  }

  currentOrganization = null;
  _sendAllErrors(startDateCron);
  console.info("\tUploaded " + globalCounterToUploaded + " transactions.");
  return { success: true, transaction_counter: globalCounterToUploaded };
}

/**
 *
 * @param {date} startDateCron
 * @returns {object}
 */
async function _sendAllErrors(startDateCron) {
  const organization_plugins = await db.organization_plugin.findAll({
    where: {
      plugin_id: CONSTANTS.PLUGIN_FUEL_CARDS_ID,
      status: 2, // status approved
      is_cron_enabled: true,
      removed: 0
    },
    raw: true
  });
  if (organization_plugins.length) {
    const organizationIds = organization_plugins.map((el) => el.id);
    const organizations = await db.organization.findAll({
      where: {
        id: {
          [Op.in]: organizationIds
        },
        removed: 0
      },
      raw: true
    });

    if (organizations.length) {
      const organization_ids = organizations.map((el) => el.id);
      const logs = await db.logs_for_api.findAll({
        where: {
          ctime: {
            [Op.between]: [new Date(startDateCron), new Date()]
          },
          organization_id: {
            [Op.in]: organization_ids
          }
        },
        raw: true
      });

      if (!logs.length) {
        return { success: true };
      }
      const realm = await db.realm.findOne({
        where: {
          admin_realm: true
        },
        raw: true
      });
      const realmId = realm.id;
      for (const organization of organizations) {
        const logs_for_organization = logs.filter(
          (el) => el.organization_id == organization.id
        );
        if (logs_for_organization.length) {
          /** TODO Нет получателя письма
               await Queue.newJob("mail-service", {
              method: "send",
              data: {
                lang: 'ru',
                code: "cron-error",
                to: user.email,
                body: {
                  message: "При попытке ежедневной выгрузке транзакций, произошли ошибки.",
                  logs_for_organization
                }
              },
              realmId
            });
               */
        } else {
          continue;
        }
      }
    }
  }
  return { success: true };
}

async function _registrationFuelFilling(data, realm, user) {
  const params = data.itemForRequest;

  const { data: result } = await requestToWialon({
    sid: data.sid,
    params,
    svc: "unit/registry_fuel_filling_event",
    host: data.host
  });

  return { result };
}

async function _getUnitsBySidAndWialonAccount({ sid, wialon_account }) {
  const aggregators = await Unit.getAggregators(wialon_account.organization_id);
  const namesForCustomFields = aggregators.map(
    (el) => el.name_for_custom_field
  );

  const params = {
    spec: {
      itemsType: "avl_unit",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name"
    },
    force: 0,
    flags: 9,
    from: 0,
    to: 0
  };

  let units = await requestToWialon({
    sid,
    params,
    svc: "core/search_items",
    host: wialon_account.wialon_hosting_url
  });

  for (let unit of units.items) {
    unit.wialon_account_id = wialon_account.id;
    const listOfCards = [];
    const cards = Object.entries(unit.flds);
    for (const card of cards) {
      card[1].is_organization_has_access = !!namesForCustomFields.includes(
        card[1].n
      );
      listOfCards.push(card[1]);
    }
    unit.flds = listOfCards;
  }

  units = units.items.flat();

  let data = {
    totalItemsCount: units.length,
    items: units
  };
  try {
    for (let i = 0; i < data.items.length; i++) {
      const keysOfFlds = Object.keys(data.items[i].flds);
      for (const aggregator of aggregators) {
        for (let j = 0; j < keysOfFlds.length; j++) {
          if (
            data.items[i].flds[keysOfFlds[j]].n ==
            aggregator.name_for_custom_field
          ) {
            data.items[i].flds[keysOfFlds[j]].aggregator_name = aggregator.name;
            data.items[i].flds[keysOfFlds[j]].aggregator_id = aggregator.id;
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

export default {
  deleteUnitTransactionsByCard,
  uploadTransactions,
  uploadTransactionsForOneUnit
};
