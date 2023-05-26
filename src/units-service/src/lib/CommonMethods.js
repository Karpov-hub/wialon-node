import db from "@lib/db";
import Wialon from "wialon";
import moment from "moment";

let WIALONTIMEOUT = 10000; //10sec

function equalsIgnoringCase(text, other) {
  return text.localeCompare(other, undefined, { sensitivity: "base" }) === 0;
}

function uniqueArray(a) {
  return Array.from(new Set(a));
}

function isArray(obj) {
  return !!obj && obj.constructor === Array;
}

async function wialonLogin(wialonAccountId, userId) {
  try {
    const user = await db.user.findOne({
      where: { id: userId }
    });

    // get wialon URL and token
    let wialonAccount = await db.wialon_accounts.findOne({
      where: {
        id: wialonAccountId,
        organization_id: user.dataValues.organization_id
      }
    });

    if (wialonAccount == null) throw "INVALIDDATA";

    if (process.env.NODE_ENV == "localtest" || process.env.NODE_ENV == "test") {
      wialonAccount.dataValues.wialon_hosting_url =
        "http://localhost:8015/units";
    }

    let url = wialonAccount.dataValues.wialon_hosting_url + "/wialon/ajax.html";

    let token = wialonAccount.dataValues.wialon_token;

    let session = await Wialon({
      url: url
    }).session;
    let loginResponse = await login(token, session);
    return { session, loginResponse };
  } catch (err) {
    console.log("CommonMethods wialonLogin err = ", err);
    if (err && (err == "WIALONTIMEOUT" || err == "INVALIDDATA")) throw err;
    throw "WIALONLOGINERROR";
  }
}

function getTimezoneOffset(loginResponse) {
  try {
    let timezone = loginResponse.user.prp.tz;
    let isTimeZoneNegative = timezone < 0 ? true : false;
    timezone = Math.abs(timezone);
    let decToHex = timezone.toString(16);
    let timezoneOffset = parseInt(
      decToHex.substring(decToHex.length - 4, decToHex.length),
      16
    );
    timezoneOffset = isTimeZoneNegative ? timezoneOffset : timezoneOffset * -1;
    return timezoneOffset;
  } catch (err) {
    console.log("CommonMethods getTimezoneOffset err = ", err);
    throw "WIALONLOGINERROR";
  }
}

function getDateRange(dateRangeType, timezoneOffset) {
  try {
    let fromDate = moment.utc().startOf("day");
    let toDate = moment.utc().endOf("day");

    if (dateRangeType == 1) {
      fromDate = fromDate;
    } else if (dateRangeType == 2) {
      fromDate = moment
        .utc()
        .subtract(1, "weeks")
        .startOf("day");
    } else {
      fromDate = moment
        .utc()
        .subtract(1, "months")
        .startOf("day");
    }
    fromDate = fromDate + timezoneOffset;
    toDate = toDate + timezoneOffset;
    fromDate = Math.round(fromDate / 1000);
    toDate = Math.round(toDate / 1000);

    return { fromDate, toDate };
  } catch (err) {
    console.log("CommonMethods getDateRange err = ", err);
    throw "INVALIDDATA";
  }
}

function login(token, session) {
  return new Promise(async (resolve, reject) => {
    let timeout = setTimeout(function() {
      timeout = null;
      reject("WIALONTIMEOUT");
    }, WIALONTIMEOUT);
    await session
      .start({
        // login
        token
      })
      .then((data) => {
        if (timeout != null) {
          clearTimeout(timeout);
          timeout = null;
          resolve(data);
        }
      })
      .catch((err) => {
        if (timeout != null) {
          clearTimeout(timeout);
          timeout = null;
          reject("WIALONLOGINERROR");
        }
      });
  });
}

async function logOut(session, bytesFromWialon) {
  let params = {};
  try {
    await sessionRequest(session, "/core/logout", params, bytesFromWialon);
  } catch (err) {
    if (err && err == "WIALONTIMEOUT") throw err;
    throw "WIALONAPIERROR";
  }
}

function sessionRequest(session, request, params, bytesFromWialon) {
  return new Promise(async (resolve, reject) => {
    let timeout = setTimeout(function() {
      console.log(
        "CommonMethods sessionRequest err WIALONTIMEOUT for request=> " +
          request
      );
      timeout = null;
      reject("WIALONTIMEOUT");
    }, WIALONTIMEOUT);
    await session
      .request(request, params)
      .then((data) => {
        if (timeout != null) {
          clearTimeout(timeout);
          timeout = null;
          bytesFromWialon.addBytes(JSON.stringify(data).length);
          resolve(data);
        }
      })
      .catch((err) => {
        if (timeout != null) {
          clearTimeout(timeout);
          timeout = null;
          console.log(
            "CommonMethods sessionRequest for request=> " + request + " err = ",
            err
          );
          reject(err);
        }
      });
  });
}

async function deleteTemplate(
  templateId,
  resourceId,
  session,
  bytesFromWialon
) {
  let params = {
    id: templateId,
    itemId: resourceId,
    callMode: "delete"
  };
  try {
    let response = await sessionRequest(
      session,
      "/report/update_report",
      params,
      bytesFromWialon
    );
    return response;
  } catch (err) {
    if (err && err == "WIALONTIMEOUT") throw err;
    throw "WIALONAPIERROR";
  }
}

async function executeTemplate(
  resourceId,
  templateId,
  unitId,
  fromDate,
  toDate,
  session,
  bytesFromWialon
) {
  let params = {
    reportResourceId: resourceId,
    reportTemplateId: templateId,
    reportObjectId: unitId.toString(),
    reportObjectSecId: 0,
    interval: {
      from: fromDate,
      to: toDate,
      flags: 0
    }
  };

  try {
    let response = await sessionRequest(
      session,
      "/report/exec_report",
      params,
      bytesFromWialon
    );
    return response;
  } catch (err) {
    if (err && err == "WIALONTIMEOUT") throw err;
    throw "WIALONAPIERROR";
  }
}

async function saveMobileUsage(
  method_name,
  cpu_time,
  bytes_sent,
  bytes_from_wialon,
  userId,
  wialonId
) {
  try {
    const user = await db.user.findOne({
      where: { id: userId }
    });

    //Convert microseconds to seconds
    cpu_time = cpu_time / 1000000;

    let usage_stat = await db.mobile_usage_stat.build({
      user_id: userId,
      organization_id: user.dataValues.organization_id,
      method_name: method_name,
      bytes_sent: bytes_sent,
      bytes_from_wialon: bytes_from_wialon,
      cpu_time: cpu_time,
      wialon_acc_id: wialonId
    });

    await usage_stat.save();

    return true;
  } catch (err) {
    console.log("CommonMethods saveMobileUsage ", err);
    throw "INVALIDDATA";
  }
}

export default {
  equalsIgnoringCase,
  uniqueArray,
  isArray,
  wialonLogin,
  getTimezoneOffset,
  getDateRange,
  deleteTemplate,
  executeTemplate,
  logOut,
  sessionRequest,
  saveMobileUsage
};
