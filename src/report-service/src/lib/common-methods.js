import sizeOf from "object-sizeof";
import db from "@lib/db";
import wialon from "wialon";
import config from "@lib/config";

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
  let lastNumber = await db.sequelize.query(
    "select max(id) as max from report_stats;"
  );
  reportStatData.id = lastNumber[0][0].max + 1;
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
    let reportDate = await reportStat.save();
    resolve(reportDate);
  });
}

async function getAllUnits(requestData) {
  return new Promise(async (resolve, reject) => {
    try {
      let wialonAccountId = requestData.wialonAccountId;
      let session = null;

      // get wialon URL and token
      let wialonAccount = await db.wialon_accounts.findByPk(wialonAccountId, {
        raw: true
      });
      if (
        process.env.NODE_ENV == "localtest" ||
        process.env.NODE_ENV == "test"
      ) {
        wialonAccount.wialon_hosting_url = `${config.wialon_hosting}/report`;
      }
      let url = wialonAccount.wialon_hosting_url + "/wialon/ajax.html";
      let token = wialonAccount.wialon_token;
      session = wialon({
        url
      }).session;
      // let token = 'a6a50ab724a137468c0bd8c75b1767218E431A722F86A0BECAC6F60C0ECEBF8CB1DA6CDA';
      await login(token, session);
      let units = await getListOfUnits(session);

      let listOfUnits = units.map((u) => {
        return {
          id: u.id,
          name: u.nm
        };
      });

      resolve(listOfUnits);
    } catch (e) {
      reject(e);
    }
  });
}

async function getAllGroups(requestData) {
  return new Promise(async (resolve, reject) => {
    try {
      var wialonAccountId = requestData.wialonAccountId;
      var session = null;

      // get wialon URL and token
      var wialonAccount = await db.wialon_accounts.findOne({
        where: {
          id: wialonAccountId
        },
        raw: true
      });

      if (
        process.env.NODE_ENV == "localtest" ||
        process.env.NODE_ENV == "test"
      ) {
        wialonAccount.wialon_hosting_url = `${config.wialon_hosting}/report`;
      }

      var url = wialonAccount.wialon_hosting_url + "/wialon/ajax.html";
      var token = wialonAccount.wialon_token;

      session = wialon({
        url
      }).session;

      // var token = 'a6a50ab724a137468c0bd8c75b1767218E431A722F86A0BECAC6F60C0ECEBF8CB1DA6CDA';
      await login(token, session);

      var units = await getListOfGroups(session);

      var listOfUnits = units.map((u) => {
        return {
          id: u.id,
          name: u.nm
        };
      });

      resolve(listOfUnits);
    } catch (e) {
      reject(e);
    }
  });
}

async function getReportName(routeId) {
  return new Promise(async (resolve, reject) => {
    try {
      // get report name from db
      const route = await db.route.findOne({
        attributes: ["report_name"],
        where: {
          id: routeId
        },
        raw: true
      });

      resolve(route.report_name);
    } catch (e) {
      reject(e);
    }
  });
}

function login(token, session) {
  return new Promise(async (resolve, reject) => {
    let responseData = null;
    await session
      .start({
        // login
        token
      })
      .then(async (data) => {
        responseData = data;
        resolve(responseData);
      })
      .catch((err) => {
        responseData = {
          error: 0,
          message: "Error loggin into wialon with the token provided"
        };
        reject(responseData);
      });
  });
}

async function getListOfUnits(session) {
  return new Promise((resolve, reject) => {
    let params = {
      spec: {
        itemsType: "avl_unit",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    };
    session
      .request("core/search_items", params)
      .then(async (unitsData) => {
        resolve(unitsData.items);
      })
      .catch((err) => {
        reject({
          error: 0,
          message: "Error getting all units"
        });
      });
  });
}

async function getListOfGroups(session) {
  return new Promise((resolve, reject) => {
    var params = {
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
    session
      .request("core/search_items", params)
      .then(async (unitsData) => {
        resolve(unitsData.items);
      })
      .catch((err) => {
        reject({
          error: 0,
          message: "Error getting all units"
        });
      });
  });
}

async function checkAllowToUser(params) {
  let notAllowedRoutesForUser = await db.certain_permissions.findAll({
    attributes: ["route_id"],
    where: {
      user_id: params.userId,
      allow_user: false,
      route_id: params.route_id,
      type_restriction: "CREATE"
    },
    raw: true
  });
  notAllowedRoutesForUser = notAllowedRoutesForUser.map((el) => el.route_id);
  return notAllowedRoutesForUser;
}

export default {
  isArray,
  getSize,
  insertInReportStats,
  updateReportStats,
  getAllUnits,
  getAllGroups,
  checkAllowToUser,
  getReportName
};
