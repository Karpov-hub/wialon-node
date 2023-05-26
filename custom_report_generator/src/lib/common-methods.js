import sizeOf from "object-sizeof";
import db from "@lib/db";
import wialon from "wialon";
import request from "request";
import config from "@lib/config";
const host = "https://hst-api.wialon.com/wialon/ajax.html?";

var reportStat = null;

function getSize(currentSize, data) {
  var updatedSize = 0;
  var sizeOfData = 0;
  if (typeof data != "string") {
    sizeOfData = sizeOf(JSON.stringify(data));
  } else {
    sizeOfData = sizeOf(data);
  }
  updatedSize = sizeOfData + currentSize;
  return updatedSize;
}

function isArray(obj) {
  return !!obj && obj.constructor === Array;
}

async function insertInReportStats(reportStatData) {
  reportStat = await db.report_stats.create(reportStatData);
  return reportStat;
}

async function updateReportStats(reportStat, reportStatData, status) {
  return new Promise(async (resolve, reject) => {
    if (status == "success") {
      reportStat.report_size = reportStatData.sizeOfDataFromWialon;
      reportStat.status = 1;
      reportStat.report_generation_time = reportStatData.diff;
      reportStat.provider_id = reportStatData.code;
    } else if (status == "error") {
      reportStat.status = 2;
      reportStat.wialon_error_code = parseInt(reportStatData.code);
      reportStat.error_message = reportStatData.message;
    }
    await reportStat.save();
    resolve(true);
  });
}

async function getAllUnits(requestData) {
  return new Promise(async (resolve, reject) => {
    try {
      var wialonAccountId = requestData.wialonAccountId;
      var session = null;

      // get wialon URL and token
      var wialonAccount = await db.wialon_accounts.findByPk(wialonAccountId);
      var url = wialonAccount.wialon_hosting_url + "/wialon/ajax.html";
      var token = wialonAccount.wialon_token;

      session = wialon({
        url,
      }).session;

      // var token = 'a6a50ab724a137468c0bd8c75b1767218E431A722F86A0BECAC6F60C0ECEBF8CB1DA6CDA';
      await login(token, session);

      var units = await getListOfUnits(session);

      var listOfUnits = units.map((u) => {
        return {
          id: u.id,
          name: u.nm,
        };
      });

      resolve(listOfUnits);
    } catch (e) {
      reject(e);
    }
  });
}

function login(token, session) {
  return new Promise(async (resolve, reject) => {
    var responseData = null;
    await session
      .start({
        // login
        token,
      })
      .then(async (data) => {
        responseData = data;
        resolve(responseData);
      })
      .catch((err) => {
        responseData = {
          error: 0,
          message: "Error loggin into wialon with the token provided",
        };
        reject(responseData);
      });
  });
}

async function getListOfUnits(session) {
  return new Promise((resolve, reject) => {
    var params = {
      spec: {
        itemsType: "avl_unit",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name",
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0,
    };
    session
      .request("core/search_items", params)
      .then(async (unitsData) => {
        resolve(unitsData.items);
      })
      .catch((err) => {
        reject({
          error: 0,
          message: "Error getting all units",
        });
      });
  });
}

async function getWeatherByCoordinates(lat, lon, date) {
  let access_key = "888cbf08bab670e804268d05ee9be302"
  let URL = `https://api.weatherstack.com/historical?access_key=${access_key}&query=${lat},${lon}&historical_date=${date}&hourly=1&interval=1`;
  return new Promise((resolve, reject) => {
    request(URL, async (err, res, body) => {
      if (err) return reject(err);
      try {
        body = JSON.parse(body);
      } catch (e) {
        return reject(e);
      }
      resolve(body);
    });
  }); 
}

// async function logout(data) {
//   let URL = host + "svc=core/logout&params={}&sid=" + data.data.eid;
//   return new Promise((resolve, reject) => {
//     request(URL, async (err, res, body) => {
//       if (err) return reject(err);
//       try {
//         body = JSON.parse(body);
//       } catch (e) {
//         return reject(e);
//       }
//       resolve(body);
//     });
//   });
// }

export default {
  isArray,
  getSize,
  insertInReportStats,
  updateReportStats,
  getAllUnits,
  // logout,
  login,
  getWeatherByCoordinates
};
