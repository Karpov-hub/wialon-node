import db from "@lib/db";
import axios from "axios";
import qs from "qs";

const host = "https://garvekswebreporter.ru";
const endpointToGetEvents = "/api/events?api-version=2";
const endpointToGetToken = "/token";

async function getAggregatorCredentials(params) {
  const res = await db.organization_aggregator_accounts.findOne({
    where: {
      organization_id: params.organization_id,
      aggregator_id: params.aggregator_id,
      removed: 0
    },
    attributes: [
      "api_key",
      "password",
      "login",
      "log_pas_required",
      "api_key_required"
    ]
  });

  return res;
}

/**
 *
 * @param {object} requestData
 * @param {object} requestData.aggregator
 * @param {string} requestData.aggregator.host
 * @param {object} requestData.params
 * @param {string} requestData.params.login
 * @param {string} requestData.params.password
 * @returns {object}
 */
async function getAggregatorToken(requestData) {
  try {
    const { data } = await axios.post(
      `${requestData.aggregator.host}${endpointToGetToken}`,
      qs.stringify({
        grant_type: "password",
        username: requestData.params.login,
        password: requestData.params.password
      }),
      {
        headers: {
          ["Content-Type"]: "application/x-www-form-urlencoded",
          ["Accept"]: "application/json"
        }
      }
    );

    return data;
  } catch (e) {
    const regexp = /[^a-zA-Z]/g;
    const exceptionCode = e?.response?.data?.error
      ? e.response.data.error.replace(regexp, "").toUpperCase()
      : "UNEXPECTEDERROR";
    throw exceptionCode;
  }
}

/**
 *
 * @param {object} requestData
 * @param {object} requestData.aggregator
 * @param {string} requestData.aggregator.id
 * @param {string} requestData.aggregator.host
 * @param {string} requestData.aggregator.name
 * @param {string} requestData.aggregator.api_key
 * @param {string} requestData.aggregator.login
 * @param {string} requestData.aggregator.password
 * @param {object} requestData.params
 * @param {string} requestData.params.login
 * @param {string} requestData.params.password
 * @param {number} requestData.start_date
 * @param {number} requestData.end_date
 * @returns {object}
 */
async function getTransactions(params) {
  const { access_token } = await getAggregatorToken(params);
  const paramsForTransactions = qs.stringify({
    StartDate: new Date(params.start_date),
    EndDate: new Date(params.end_date),
    IdKolonka: "",
    FirmName: "",
    NumPetrol: "0",
    FilterSystemEvent: "0"
  });

  const config = {
    method: "post",
    url: `${host}${endpointToGetEvents}`,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: paramsForTransactions
  };

  const { data: transactions } = await axios(config);
  if (!transactions) {
    throw "SERVERAPIISNOTWORKING";
  }

  if (Array.isArray(transactions) && !transactions.length) {
    throw "NOONETRANSACTIONSTOUPLOAD";
  }

  const parsedTxs = await parseData(transactions, params.aggregator);
  if (Array.isArray(parsedTxs)) {
    return parsedTxs;
  }

  throw "INVALIDCREDENTIALSFORAGGREGATOR";
}

async function parseData(transactions, aggregator) {
  let res = [];
  for (const tx of transactions) {
    let stringForDescription = `Transaction ID:${tx.Id};Card number:${tx.IdUser};Date and time of refueling:${tx.DataTime};Amount of refueling:${tx.Coast};Fuel amount:${tx.AmountFuel}; Fuel type: ${tx.NameTank}; Fuel price: ${tx.Coast}; Service point: ${tx.NumPetrol}; Service point address: none; Service point coordinates:${tx.Latitude}:${tx.Longitude};aggregator_id:${aggregator.id};Aggregator name:${aggregator.name}`;
    res.push({
      description: stringForDescription,
      date: tx.UnixTimeStamp,
      x: tx.Longitude,
      y: tx.Latitude,
      deviation: 30,
      volume: tx.AmountFuel,
      location: "",
      cost: tx.Coast,
      id_card: tx.IdUser,
      id: tx.Id
    });
  }
  return res;
}

async function testMethodGarveks(params, realm, user) {
  const aggregator = await db.aggregator.findOne({
    where: {
      id: params.id
    },
    raw: true
  });

  if (!aggregator) {
    throw "AGGREGATORNOTFOUND";
  }

  if (aggregator && aggregator.api_key_required && !params.api_key) {
    throw "APIKEYISREQUIRED";
  }

  if (
    aggregator &&
    aggregator.log_pas_required &&
    (!params.login || !params.password)
  ) {
    throw "LOGINPASSWORDISREQUIRED";
  }

  if (
    aggregator &&
    aggregator.contract_number_required &&
    !params.contract_number
  ) {
    throw "CONTRACTNUMBERREQUIRED";
  }

  const credentialsForUseApi = await getAggregatorToken({ params, aggregator });

  if (credentialsForUseApi.access_token) {
    return {
      success: true,
      message:
        "The data for the aggregator is up-to-date (a test request was made to the aggregator API)"
    };
  }

  throw "INVALIDCREDENTIALSFORAGGREGATOR";
}

export default {
  getAggregatorToken,
  getTransactions,
  testMethodGarveks
};
