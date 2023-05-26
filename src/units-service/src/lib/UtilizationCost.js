import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getUtilizationCostDetails(requestData, realmId, userId) {         
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
  let utilizationCostData = {};

  if (Object.keys(templateOutput).length > 0) {
    utilizationCostData = await getutilizationCostData(templateOutput, timezoneOffset);        
  } else {
    utilizationCostData = await setDefaultData();
  }
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);   
  await commonMethods.logOut(session, bytesFromWialon);      
  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(utilizationCostData).length;

  await commonMethods.saveMobileUsage("getUtilizationCostDetails", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);
  return utilizationCostData;
}

async function setDefaultData() {
  let utilizationCostData = {};
  utilizationCostData.utilizationCosts = [];
  utilizationCostData.utilizationCostsCount = 0;

  return utilizationCostData;
}

async function getutilizationCostData(reportData, timezoneOffset) {
  let utilizationCostData = {};
  if (reportData.hasOwnProperty('utilizationCostRows') && reportData.utilizationCostRows!=null) {
      utilizationCostData.utilizationCosts = [];
      utilizationCostData.utilizationCostsCount = 0;
      for (const key in reportData.utilizationCostRows) {    
          let fed = reportData.utilizationCostRows[key];
          let utilizationCostRow = {};
          utilizationCostRow.time = "";
          if (fed['c'][0]['t']) {
              let tripTimestamp = moment.utc(fed['c'][0]['t'], 'YYYY-MM-DD hh:mm:ss');
              tripTimestamp = (Math.round(tripTimestamp/1000)) +  ((-1) *timezoneOffset);      
              let tripDateTime =  moment.utc(tripTimestamp*1000).format("Do MMM'YY hh:mm A");
              utilizationCostRow.time = tripDateTime;
          }

          utilizationCostRow.registrationTime = fed['c'][1]['t'] ? fed['c'][1]['t'] : fed['c'][1];
          utilizationCostRow.expenseItem = fed['c'][2]['t'] ? fed['c'][2]['t'] : fed['c'][2];
          utilizationCostRow.description = fed['c'][3]['t'] ? fed['c'][3]['t'] : fed['c'][3];
          utilizationCostRow.position = {};
          utilizationCostRow.position.name = "";
          utilizationCostRow.position.lat = 0.0;
          utilizationCostRow.position.long = 0.0;
          if (fed['c'][4]) {
              utilizationCostRow.position.name = fed['c'][4]['t'];
              utilizationCostRow.position.lat = fed['c'][4]['y'];
              utilizationCostRow.position.long = fed['c'][4]['x'];
          }
          utilizationCostRow.cost = fed['c'][5]['t'] ? String(fed['c'][5]['t']) : String(fed['c'][5]);
          utilizationCostRow.count = fed['c'][6]['t'] ? String(fed['c'][6]['t']) : String(fed['c'][6]);
          utilizationCostRow.notes = fed['c'][7]['t'] ? fed['c'][7]['t'] : fed['c'][7];

          utilizationCostData.utilizationCosts.push(utilizationCostRow);
      }
      utilizationCostData.utilizationCostsCount = utilizationCostData.utilizationCosts.length;
  }
  return utilizationCostData;
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
              reportData.utilizationCostHeaders = table['header'];              
              reportData.utilizationCostTotal = table['total'];
          }
        }

        // getting result from wialon
         await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('utilizationCostHeaders')
                    && reportData.utilizationCostHeaders!=null) {
                reportData.utilizationCostRows = reportDataOutput[0];
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getUtilizationCostDetails getReportOutput err = ", err);          
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
      "n": "Utilization Cost Report",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_utilization_cost",
          "l": "Utilization cost",
          "f": 16,
          "c": "[\"time\",\"recv_time\",\"evt_type\",\"evt_text\",\"place\",\"cost\",\"events_count\",\"dummy\"]",
          "cl": "[\"Time\",\"Registration time\",\"Expense item\",\"Description\",\"Location\",\"Cost\",\"Count\",\"Notes\"]",
          "cp": "[{},{},{},{},{},{},{},{}]",
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
    console.log("getUtilizationCostDetails generateTemplate err = ", err);     
    if(err && err == 'WIALONTIMEOUT') reject(err);       
    reject('WIALONAPIERROR');
  });
  });
}

export default {
  getUtilizationCostDetails
};