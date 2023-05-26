import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getFuelEntries(requestData, realmId, userId) {   
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

  let fuelEntryData = {};
 
  if (Object.keys(templateOutput).length > 0) {
    fuelEntryData = await getFuelEntryData(templateOutput, timezoneOffset);        
  } else {
    fuelEntryData = await setDefaultData();
  }
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);                  
  await commonMethods.logOut(session, bytesFromWialon);

  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(fuelEntryData).length;

  await commonMethods.saveMobileUsage("getFuelEntries", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);

  return fuelEntryData;
}

async function setDefaultData() {
  let fuelEntryData = {};
  fuelEntryData.fuelEntries = [];
  fuelEntryData.fuelEntriesCount = 0;

  return fuelEntryData;
}

async function getFuelEntryData(reportData, timezoneOffset) {
  let fuelEntryData = {};
  if (reportData.hasOwnProperty('fuelEntryRows') && reportData.fuelEntryRows != null) {
      fuelEntryData.fuelEntries = [];
      fuelEntryData.fuelEntriesCount = 0;

      for (const key in reportData.fuelEntryRows) {    
          let fed = reportData.fuelEntryRows[key];
          let fuelEntryRow = {};

          fuelEntryRow.time = "";
          if (fed['c'][0]['t']) {
              let tripTimestamp = moment.utc(fed['c'][0]['t'], 'YYYY-MM-DD hh:mm:ss');
              tripTimestamp = (Math.round(tripTimestamp/1000)) +  ((-1) *timezoneOffset);      
              let tripDateTime =  moment.utc(tripTimestamp*1000).format("Do MMM'YY hh:mm A");
              fuelEntryRow.time = tripDateTime;
          }

          fuelEntryRow.position = {};
          fuelEntryRow.position.name = fed['c'][1]['t'];
          fuelEntryRow.position.lat = fed['c'][1]['y'];
          fuelEntryRow.position.long = fed['c'][1]['x'];
          fuelEntryRow.initialFuelLevel = fed['c'][2];
          fuelEntryRow.finalFuelLevel = fed['c'][3];
          fuelEntryRow.fuelFilled = fed['c'][4];
          fuelEntryRow.differenceInFuel = fed['c'][5];
          fuelEntryRow.count = fed['c'][6];
          fuelEntryRow.kms = fed['c'][7];

          fuelEntryData.fuelEntries.push(fuelEntryRow);
      }
      fuelEntryData.fuelEntriesCount = fuelEntryData.fuelEntries.length;
  }
  return fuelEntryData;
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
          if (table.name == 'unit_fillings') {              
              reportData.fuelEntryHeaders = table['header'];              
              reportData.fuelEntryTotal = table['total'];
          }
        }

        // getting result from wialon
        await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('fuelEntryHeaders')
                  && reportData.fuelEntryHeaders!=null) {
                reportData.fuelEntryRows = reportDataOutput[0];
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getFuelEntries getReportOutput err = ", err);
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
          "n": "unit_fillings",
          "l": "Fuel fillings",
          "f": 16,
          "c": "[\"time_end\",\"location_end\",\"fuel_level_begin\",\"fuel_level_filled\",\"filled\",\"difference\",\"count\",\"absolute_mileage_begin\",\"initial_counter_sensors\"]",
          "cl": "[\"Time\",\"Location\",\"Initial fuel level\",\"Final fuel level\",\"Filled\",\"Difference\",\"Count\",\"Mileage\",\"Counter\"]",
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
     console.log("getFuelEntries generateTemplate err = ", err);
     if(err && err == 'WIALONTIMEOUT') reject(err);
     reject('WIALONAPIERROR');
   });
  });
}

export default {
  getFuelEntries
};