import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getFuelUsageDetails(requestData, realmId, userId) {     
  let resourceId;
  let session = null;
  let templateId = null;
  const startUsage = process.cpuUsage();
  const bytesFromWialon = new BytesFromWialon();
  let wialonLogin = await commonMethods.wialonLogin(requestData.wialonAccountId, userId);
  let loginResponse = wialonLogin.loginResponse;
  session = wialonLogin.session;      
  let timezoneOffset = await commonMethods.getTimezoneOffset(loginResponse);            
  let dateRange = await commonMethods.getDateRange(requestData.dateRangeType, timezoneOffset);
  let unitId = requestData.unitId;    
  resourceId = loginResponse.user.bact ? loginResponse.user.bact : 0;
  
  // generate template 
  let tripTemplate = await generateTemplate(resourceId, session, bytesFromWialon);
  templateId = tripTemplate[0];

  //execute template and get the result
  let executedTemplate = await commonMethods.executeTemplate(resourceId, templateId,
                                unitId, dateRange.fromDate, dateRange.toDate, session, bytesFromWialon);      
  let templateOutput = await getReportOutput(executedTemplate, session, bytesFromWialon);
  let fuelUsageData = {};
 
  if (Object.keys(templateOutput).length > 0) {
    fuelUsageData = await getFuelUsageData(templateOutput, timezoneOffset);        
  } else {
    fuelUsageData = await setDefaultData();
  }
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);                  
  await commonMethods.logOut(session, bytesFromWialon);
  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(fuelUsageData).length;

  await commonMethods.saveMobileUsage("getFuelUsageDetails", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);

  return fuelUsageData;
}

async function setDefaultData() {
  let fuelUsageData = {};
  fuelUsageData.fuelUsages = [];
  fuelUsageData.fuelUsagesCount = 0;

  return fuelUsageData;
}

async function getFuelUsageData(reportData, timezoneOffset) {
  let fuelUsageData = {};
  if (reportData.hasOwnProperty('fuelUsageRows') && reportData.fuelUsageRows!=null) {
      fuelUsageData.fuelUsages = [];
      fuelUsageData.fuelUsagesCount = 0;
      for (const key in reportData.fuelUsageRows) {    
          let fed = reportData.fuelUsageRows[key];
          let fuelUsageRow = {};
          fuelUsageRow.time = "";
          if (fed['c'][0]['t']) {
              let tripTimestamp = moment.utc(fed['c'][0]['t'], 'YYYY-MM-DD hh:mm:ss');
              tripTimestamp = (Math.round(tripTimestamp/1000)) +  ((-1) *timezoneOffset);      
              let tripDateTime =  moment.utc(tripTimestamp*1000).format("Do MMM'YY hh:mm A");
              fuelUsageRow.time = tripDateTime;
          }

          fuelUsageRow.duration = fed['c'][1];
          fuelUsageRow.position = {};
          fuelUsageRow.position.name = "";
          fuelUsageRow.position.lat = 0.0;
          fuelUsageRow.position.long = 0.0;

          if (fed['c'][2]) {
              fuelUsageRow.position.name = fed['c'][2]['t'];
              fuelUsageRow.position.lat = fed['c'][2]['y'];
              fuelUsageRow.position.long = fed['c'][2]['x'];
          }
          fuelUsageRow.type = fed['c'][3]['t'] ? fed['c'][3]['t'] : fed['c'][3];
          fuelUsageRow.fuelVolume = fed['c'][4];
          fuelUsageRow.sensorName = fed['c'][5];
          fuelUsageRow.fuelFilled = fed['c'][6];
          fuelUsageRow.fuelDeviation = fed['c'][7];
          fuelUsageRow.notes = fed['c'][8];
          fuelUsageData.fuelUsages.push(fuelUsageRow);
      }
      fuelUsageData.fuelUsagesCount = fuelUsageData.fuelUsages.length;
  }
  return fuelUsageData;
}

async function getReportOutput(executeReportOutput, session, bytesFromWialon) {
  return new Promise(async (resolve, reject) => {
    let tables = executeReportOutput['reportResult']['tables'];              
    let reportDataParams = [];
    let tableIndex = 0;
    let reportData = {};
    if (tables.length > 0) {
        for (const key in tables) {    
          const table = tables[key];
          // params for fetching result from wialon after executing report
          let params = {
              "svc" : "report/get_result_rows",
              "params" : {
                "tableIndex" : tableIndex,
                "indexFrom" : 0,
                "indexTo" : table.rows
              }
            };
          reportDataParams.push(params);                      
          tableIndex++;

          // getting the headers of 2 tables which we get after executing the report
          if (table.name == 'unit_fuel_traffic') {              
              reportData.fuelUsageHeaders = table['header'];              
              reportData.fuelUsageTotal = table['total'];
          }
        }

        // getting result from wialon
        await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('fuelUsageHeaders')
                    && reportData.fuelUsageHeaders!=null) {
                reportData.fuelUsageRows = reportDataOutput[0];
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getFuelUsageDetails getReportOutput err = ", err);
          if(err && err == 'WIALONTIMEOUT') reject(err);
          reject('WIALONAPIERROR');
        });        
    } else { 
      resolve(reportData);        
    }
  });
}

async function generateTemplate(resourceId, session, bytesFromWialon) {
  return new Promise(async (resolve, reject) => {
    let reportGenParams = {
    "id": 0,
    "ct": "avl_unit",
    "n": "Fuel Entry Report",
    "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
    "tbl": [
      {
        "n": "unit_fuel_traffic",
        "l": "Fuel traffic",
        "f": 16,
        "c": "[\"time_begin\",\"duration\",\"location_end\",\"fuel_traffic_type\",\"amount\",\"sensor_name\",\"filled\",\"difference\",\"dummy\"]",
        "cl": "[\"Beginning\",\"Duration\",\"Location\",\"Type\",\"Volume\",\"Sensor name\",\"Filled\",\"Deviation\",\"Notes\"]",
        "cp": "[{},{},{},{},{},{},{},{},{}]",
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
    console.log("getFuelUsageDetails generateTemplate err = ", err);
    if(err && err == 'WIALONTIMEOUT') reject(err);
    reject('WIALONAPIERROR');
  });
  });
}

export default {
  getFuelUsageDetails
};