import wialon from "wialon";
import sizeOf from "object-sizeof";
import db from "@lib/db";

function login(token, session) {
  return new Promise(async (resolve, reject) => {
    var responseData = null;
    await session
      .start({
        token
      })
      .then(async data => {
        responseData = data;
        sizeOfDataFromWialon = await getSize(
          sizeOfDataFromWialon,
          responseData
        );
        resolve(responseData);
      })
      .catch(err => {
        responseData = {
          error: 0,
          message: "Error loggin into wialon with the token provided"
        };
        reject(responseData);
      });
  });
}

async function getSize(currentSize, data) {
  return new Promise((resolve, reject) => {
    var updatedSize = 0;
    var sizeOfData = 0;
    if (typeof data != "string") {
      sizeOfData = sizeOf(JSON.stringify(data));
    } else {
      sizeOfData = sizeOf(data);
    }
    updatedSize = sizeOfData + currentSize;
    resolve(updatedSize);
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
        url
      }).session;

      await login(token, session);
      var units = await getListOfUnits(session);
      var listOfUnits = units.map(u => {
        return {
          id: u.id,
          name: u.nm
        };
      });

      resolve(listOfUnits);
    } catch (e) {
      resolve(e);
    }
  });
}

async function getListOfUnits(session) {
  return new Promise((resolve, reject) => {
    var params = {
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
      .then(async unitsData => {
        resolve(unitsData.items);
      })
      .catch(err => {
        reject({
          error: 0,
          message: "Error getting all units"
        });
      });
  });
}

export default {
  login,
  getSize,
  getAllUnits
};
