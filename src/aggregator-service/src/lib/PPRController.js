import db from "@lib/db";
import axios from "axios";
const host = "https://online.petrolplus.ru";
const tzOffsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000;

async function getTransactions(params) {
  params.start_date = formatDate(
    new Date(params.start_date + tzOffsetInMilliseconds)
  );
  params.end_date = formatDate(
    new Date(params.end_date + tzOffsetInMilliseconds)
  );

  try {
    const config = {
      method: "get",
      url: `${host}/api/public-api/v2/transactions?dateFrom=${params.start_date}&dateTo=${params.end_date}&format=json`,
      headers: {
        "Content-Type": "application/json",
        Authorization: params.params.api_key,
        "Cache-Control": "no-cache"
      },
      data: ""
    };
    const { data: res } = await axios(config);
    if (Array.isArray(res.transactions)) {
      const arrayForResponse = await parseData(
        res.transactions,
        params.aggregator,
        params.tz
      );
      return arrayForResponse;
    } else {
      throw "INVALIDCREDENTIALSFORAGGREGATOR";
    }
  } catch (e) {
    console.log(e);
    throw "INVALIDCREDENTIALSFORAGGREGATOR";
  }
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate())
  ].join("-");
}

async function parseData(transactions, aggregator, tz) {
  if (!transactions.length) {
    return [];
  }
  let res = [];
  for (const tx of transactions) {
    let stringForDescription = `Transaction ID:${tx.idTrans};Card number:${tx.cardNum};Date and time of refueling:${tx.date};Refill amount:${tx.sum};Fuel amount:${tx.amount};Fuel type:${tx.serviceName};Fuel price:${tx.price};Servicepoint:${tx.posName};Servicepoint address:${tx.posAddress};Servicepoint coordinates:${tx.latitude}:${tx.longitude};aggregator_id:${aggregator.id};Aggregator name:${aggregator.name}`;
    res.push({
      description: stringForDescription,
      date: (Date.parse(tx.date) + (tz * 1000 + tzOffsetInMilliseconds)) / 1000,
      x: tx.longitude,
      y: tx.latitude,
      deviation: 30,
      volume: tx.amount,
      location: tx.posAddress,
      cost: tx.sum,
      id_card: tx.cardNum,
      id: tx.idTrans
    });
  }
  return res;
}

async function testMethodPPR(params, realm, user) {
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
  const credentialsForUseApi = await getTransactions({
    params,
    aggregator,
    start_date: new Date(),
    end_date: new Date()
  });

  if (Array.isArray(credentialsForUseApi)) {
    return {
      success: true,
      message:
        "The data for the aggregator is up-to-date (a test request was made to the aggregator API)"
    };
  }

  throw "INVALIDCREDENTIALSFORAGGREGATOR";
}

export default {
  getTransactions,
  testMethodPPR
};
