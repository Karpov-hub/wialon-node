import db from "@lib/db";
import axios from "axios";
import { checkParamsPropertiesForAggregator } from "@lib/utils";
const tzOffsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000;

async function getTransactions({
  params,
  aggregator,
  start_date,
  end_date,
  tz
}) {
  start_date = new Date(start_date - tzOffsetInMilliseconds).toISOString();
  end_date = new Date(end_date - tzOffsetInMilliseconds).toISOString();

  try {
    const config = {
      method: "get",
      url: `${aggregator.host}/api/emv/v2/GetOperByContract?u=${params.login}&p=${params.password}&contract=${params.contract_number}&begin=${start_date}&end=${end_date}&type=JSON`,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    };
    const { data: res } = await axios(config);
    if (Array.isArray(res.OperationList)) {
      const arrayForResponse = await parseData(
        res.OperationList,
        aggregator,
        tz
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

async function parseData(transactions, aggregator, tz) {
  if (!transactions.length) {
    return [];
  }
  let res = [];
  for (const tx of transactions) {
    let stringForDescription = `Transaction ID:${tx.Code};Card number:${tx.Card};Date and time of refueling:${tx.Date};Refill amount:${tx.Sum};Fuel amount:${tx.Value}; Fuel type: ${tx.GName}; Fuel price: ${tx.Price}; Service Point: ${tx.PosCode}; Service Point Address: ${tx.Address}; Service point coordinates:none;aggregator_id:${aggregator.id};Aggregator name:${aggregator.name}`;

    res.push({
      description: stringForDescription,
      date: (Date.parse(tx.Date) + (tz * 1000 + tzOffsetInMilliseconds)) / 1000,
      x: 0,
      y: 0,
      deviation: 30,
      volume: tx.Type === 24 ? tx.Value * -1 : tx.Value,
      location: tx.Address,
      cost: tx.Type === 24 ? tx.Sum * -1 : tx.Sum,
      id_card: tx.Card,
      id: tx.Code
    });
  }
  return res;
}

async function testMethodRosneft(params, realm, user) {
  const aggregator = await db.aggregator.findOne({
    where: {
      id: params.id
    },
    raw: true
  });

  await checkParamsPropertiesForAggregator({ aggregator, params });

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
  testMethodRosneft
};
