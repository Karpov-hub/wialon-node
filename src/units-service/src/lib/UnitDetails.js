import db from "@lib/db";
import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getUnitDetailsData(requestData, realmId, userId) { 
  const startUsage = process.cpuUsage();
  const bytesFromWialon = new BytesFromWialon();
  let wialonLogin = await commonMethods.wialonLogin(requestData.wialonAccountId, userId);
  let loginResponse = wialonLogin.loginResponse;
  let session = wialonLogin.session;      
  let resourceID = loginResponse.user.bact ? loginResponse.user.bact : 0;
  let unitData = await getUnitsData(session, requestData, resourceID, bytesFromWialon);      
  let wialonAccount = await db.wialon_accounts.findByPk(requestData.wialonAccountId);
  const unitDriverData = await getUnitDriversData(unitData, resourceID, wialonAccount.wialon_hosting_url, session, bytesFromWialon);
  await commonMethods.logOut(session, bytesFromWialon);

  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(unitDriverData).length;

  await commonMethods.saveMobileUsage("getUnitDetailsData", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);
        
  return unitDriverData;
}

async function getUnitsData(session, requestData, resourceId, bytesFromWialon) {
  return new Promise(async (resolve, reject) => {    
    var params = [
      {
        "svc": "core/search_item",
        "params": {
          "id": requestData.unitId,
          "flags": 14688273
        }
      },
      {
        "svc": "core/search_item",
        "params": {
          "id": resourceId,
          "flags": 256
        }
      }
    ];
    
    await commonMethods.sessionRequest(session, "/core/batch", params, bytesFromWialon)
      .then(unitsData => {      
        resolve(unitsData);        
      })
      .catch(err => {
        console.log("getUnitDetailsData getUnitsData err = ", err);
        if(err && err == 'WIALONTIMEOUT') reject(err);
        reject('WIALONAPIERROR');
      });
  });
}

async function getUnitDriversData(data, resourceId, url, session, bytesFromWialon) {
  
  let driversData =  data[1].item.drvrs ? data[1].item.drvrs:[];
  let unitData = data[0].item ? data[0].item:{};

  let unitInfo = {};      
  unitInfo.unitId = unitData.id;
  unitInfo.unitName = unitData.nm;
  unitInfo.status = unitData.netconn;
  unitInfo.distanceTravelled = unitData.cnm;
  unitInfo.driverName = "Unknown";
  unitInfo.driverId = -1;
  unitInfo.driverImage = "";
  unitInfo.regNo = "";

  unitInfo.unitImage = unitData.uri && unitData.uri.length > 0 ? url+unitData.uri : "";    
  unitInfo.position = {};    
  unitInfo.position.lat = 0;
  unitInfo.position.long = 0;

  if (unitData.hasOwnProperty('pos') && unitData.pos!=null) {
      unitInfo.position.lat = unitData.pos.y;
      unitInfo.position.long = unitData.pos.x;
  }
  // below values are hardcoded
  unitInfo.tripTracking = 4;
  unitInfo.fuelEntries = 4;
  unitInfo.serviceEntries = 10;
  unitInfo.checked = true;

  if(unitData.hasOwnProperty('pflds') && unitData.pflds != null) {
    let pflds = unitData.pflds;
    for (const key in pflds) {  
      if (pflds[key].n == 'registration_plate') {
        unitInfo.regNo = pflds[key].v;
      }
    }
  }

  for (const driver in driversData) {   
    if(unitInfo.id == driversData[driver].bu) {
      unitInfo.driverName = driversData[driver].n;
      unitInfo.driverId = driversData[driver].id;
      unitInfo.driverImage = driversData[driver].ck;     
      unitInfo.driverImage = driversData[driver].ck != 0 ? 
                              url +"/avl_driver_image/" + resourceId + "/" + unitInfo.driverId + 
                              "/100/" + "/1/" + driversData[driver].ck + ".png" : "";   
      break;
    }  
  }        
  let ratings = await getUnitRatings(resourceId, unitInfo.unitId, session, bytesFromWialon);
  let ratingsByUnit = await getRatingsByUnit(ratings);
  unitInfo.avgScore = ratingsByUnit;
return unitInfo;
}

async function getRatingsByUnit(ratings) {
  let rating = "";
  if (ratings.hasOwnProperty('rankingTotal') && ratings.rankingTotal != null) {
    rating = ratings.rankingTotal[0];
    rating = (rating / 6.0) * 100;
    rating = Math.round(rating) + "/100";
  } else {
      rating = "0/100";
      if (ratings.hasOwnProperty('tripTotal') && ratings.tripTotal != null && 
      ratings.tripTotal> 0) rating = "100/100";
  }
  return rating;
}

async function getUnitRatings(resourceId, unitId, session, bytesFromWialon) {
  let templateId = null;
  var fromDate = moment.utc().startOf('day'); 
  var toDate = moment.utc().endOf('day'); 
  fromDate = Math.round(fromDate/1000);
  toDate = Math.round(toDate/1000);

  let rankTemplate = await generateTemplate(resourceId, session, bytesFromWialon);
  templateId = rankTemplate[0];
  let executedTemplate = await commonMethods.executeTemplate(resourceId, templateId,
    unitId, fromDate, toDate, session, bytesFromWialon);  
  let templateOutput = await getReportOutput(executedTemplate);

  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);
  return templateOutput;
}

async function getReportOutput(executeReportOutput) {
  let tables = executeReportOutput['reportResult']['tables'];              
  let reportData = {};
  if (tables.length > 0) {
      for (const key in tables) {    
        const table = tables[key];
        
        if (table.name == 'unit_ecodriving') {
          reportData.rankingTotal = table.total;
        }
        if (table.name == 'unit_trips') {
          reportData.tripTotal = table.rows;
        }
      }    
      return reportData;  
  } else { 
    return reportData;
  }
}

async function generateTemplate(resourceId, session, bytesFromWialon) {
  return new Promise(async (resolve, reject) => {
    let reportGenParams = {
      "id": 0,
      "ct": "avl_unit",
      "n": "Rating Report",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_ecodriving",
          "l": "Violation Rank",
          "f": 16,
          "c": "[\"violation_rank\"]",
          "cl": "[\"Rank\"]",
          "cp": "[{}]",
          "p": "{\"violation_group_name\":\"*\"}",
          "sch": {
            "y": 0,
            "m": 0,
            "w": 0,
            "f1": 0,
            "f2": 0,
            "t1": 0,
            "t2": 0,
            "fl": 0
          },
          "sl": "",
          "s": ""
        },
        {
          "n": "unit_trips",
          "l": "Trips",
          "f": 16,
          "c": "[\"time_begin\"]",
          "cl": "[\"Beginning\"]",
          "cp": "[{}]",
          "p": "",
          "sch": {
            "y": 0,
            "m": 0,
            "w": 0,
            "f1": 0,
            "f2": 0,
            "t1": 0,
            "t2": 0,
            "fl": 0
          },
          "sl": "",
          "s": ""
        }
      ],
      "t": "avl_unit",
      "itemId": resourceId,
      "callMode": "create"
    }; 


   // creating the report template
   await commonMethods.sessionRequest(session, "/report/update_report", reportGenParams, bytesFromWialon)
   .then(reportGenOutput => {          
     resolve(reportGenOutput);        
   })
   .catch(err => {    
    console.log("getUnitDetailsData generateTemplate err = ", err);
    if(err && err == 'WIALONTIMEOUT') reject(err);
    reject('WIALONAPIERROR');
  });
  });
}

export default {
  getUnitDetailsData
};