import commonMethods from "./CommonMethods";
import db from "@lib/db";
import BytesFromWialon from "./BytesFromWialon";

async function getUnitResourceData(requestData, realmId, userId) {
  const startUsage = process.cpuUsage();
  const bytesFromWialon = new BytesFromWialon();
  let wialonLogin = await commonMethods.wialonLogin(
    requestData.wialonAccountId,
    userId
  );
  let loginResponse = wialonLogin.loginResponse;
  let session = wialonLogin.session;
  let resourceId = loginResponse.user.bact ? loginResponse.user.bact : 0;

  let units = await getListOfUnits(session, requestData, bytesFromWialon);

  let wialonAccount = await db.wialon_accounts.findByPk(
    requestData.wialonAccountId
  );
  const listOfUnits = await getUnitDriversData(
    units,
    resourceId,
    wialonAccount.wialon_hosting_url
  );
  await commonMethods.logOut(session, bytesFromWialon);

  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(listOfUnits).length;

  await commonMethods.saveMobileUsage(
    "getUnitResourceData",
    cpuTime,
    bytesSent,
    bytesFromWialon.Bytes,
    userId,
    requestData.wialonAccountId
  );

  return listOfUnits;
}

async function getListOfUnits(session, requestData, bytesFromWialon) {
  var params = [
    {
      svc: "/core/search_items",
      params: {
        spec: {
          itemsType: "avl_unit",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name"
        },
        force: 0,
        flags: 10493953,
        from: requestData.startsWith,
        to: requestData.startsWith + (requestData.numOfRecords - 1)
      }
    },
    {
      svc: "/core/search_items",
      params: {
        spec: {
          itemsType: "avl_resource",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name"
        },
        force: 0,
        flags: 256,
        from: 0,
        to: 0
      }
    }
  ];

  let unitsData = await commonMethods.sessionRequest(
    session,
    "/core/batch",
    params,
    bytesFromWialon
  );
  return unitsData;
}

async function getUnitDriversData(data, resourceId, url) {
  let unitDriversData = [];
  let drivers = {};
  let driversData = data[1].items[0].drvrs ? data[1].items[0].drvrs : [];
  let unitsData = data[0].items ? data[0].items : [];
  let totalUnits = data[0].totalItemsCount;

  for (const driver in driversData) {
    drivers[driversData[driver].bu] = {
      name: driversData[driver].n,
      id: driversData[driver].id,
      ck: driversData[driver].ck
    };
  }

  for (const unit in unitsData) {
    let unitInfo = {};
    unitInfo.unitId = unitsData[unit].id;
    unitInfo.unitName = unitsData[unit].nm;
    unitInfo.status = unitsData[unit].netconn;
    unitInfo.distanceTravelled = unitsData[unit].cnm;
    unitInfo.driverName = "Unknown";
    unitInfo.driverId = -1;
    unitInfo.driverImage = "";
    unitInfo.regNo = "";

    if (unitsData[unit].pflds) {
      let pflds = unitsData[unit].pflds;
      for (const key in pflds) {
        if (pflds[key].n == "registration_plate") {
          unitInfo.regNo = pflds[key].v;
        }
      }
    }

    if (drivers[unitInfo.unitId]) {
      let driverData = drivers[unitInfo.unitId];
      unitInfo.driverName = driverData.name;
      unitInfo.driverId = driverData.id;
      unitInfo.driverImage =
        driverData.ck != 0
          ? url +
            "/avl_driver_image/" +
            resourceId +
            "/" +
            driverData.id +
            "/100/" +
            "/1/" +
            driverData.ck +
            ".png"
          : "";
    }
    unitDriversData.push(unitInfo);
  }

  return { units: unitDriversData, unitCount: totalUnits };
}

export default {
  getUnitResourceData
};
