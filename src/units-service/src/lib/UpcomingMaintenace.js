import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getUpcomingMaintenance(requestData, realmId, userId) {       
  let resourceId;
  let session = null; 
  let templateId = null;
    
  let inputValues = inputValidations(requestData);
  const startUsage = process.cpuUsage();
  const bytesFromWialon = new BytesFromWialon();
  let wialonLogin = await commonMethods.wialonLogin(requestData.wialonAccountId, userId);
  let loginResponse = wialonLogin.loginResponse; 
  session = wialonLogin.session;      
  let timezoneOffset = await commonMethods.getTimezoneOffset(loginResponse);            
  let unitId = requestData.unitId;    
  resourceId = loginResponse.user.bact ? loginResponse.user.bact : 0;
 
  let fromDate = inputValues.fromDate + timezoneOffset;
  let toDate = inputValues.toDate + timezoneOffset;

  fromDate = Math.round(fromDate/1000); 
  toDate = Math.round(toDate/1000);      
  
  // generate template 
  let tripTemplate = await generateTemplate(resourceId, session, bytesFromWialon);
  templateId = tripTemplate[0];

  //execute template and get the result
  let executedTemplate = await commonMethods.executeTemplate(resourceId, templateId,
                                unitId, fromDate, toDate, session, bytesFromWialon);  
  let templateOutput = await getReportOutput(executedTemplate, session, bytesFromWialon);
  let upcomingServiceData = {};

  if (Object.keys(templateOutput).length > 0) {
    upcomingServiceData = await getupcomingServiceData(templateOutput);        
  } else {
    upcomingServiceData = await setDefaultData();
  }
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);   
  await commonMethods.logOut(session, bytesFromWialon);
  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(upcomingServiceData).length;

  await commonMethods.saveMobileUsage("getUpcomingMaintenance", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);
  return upcomingServiceData;
}

function inputValidations(requestData) {
let fromDate = moment(new Date(requestData.fromDate)).startOf('day');
let toDate = moment(new Date(requestData.toDate)).endOf('day');
let now = moment(new Date()).endOf('day');      

if((fromDate > toDate) || (fromDate < now) || (toDate < now)) {
  throw "DATEGREATERTODAY";
}
return {fromDate, toDate};
}

async function setDefaultData() {
  let upcomingServiceData = {};
  upcomingServiceData.upcomingServices = [];
  upcomingServiceData.upcomingServicesCount = 0;

  return upcomingServiceData;
}

async function getupcomingServiceData(reportData) {
  let upcomingServiceData = {};
  if (reportData.hasOwnProperty('upcomingServiceRows') && reportData.upcomingServiceRows!=null) {
      upcomingServiceData.upcomingServices = [];
      upcomingServiceData.upcomingServicesCount = 0;
      for (const key in reportData.upcomingServiceRows) {    
          let fed = reportData.upcomingServiceRows[key];
          let upcomingServiceRow = {};
          
          upcomingServiceRow.serviceInterval = fed['c'][0];
          upcomingServiceRow.state = fed['c'][1];
          upcomingServiceRow.stateByMileage = fed['c'][2];
          upcomingServiceRow.stateByEngineHours = fed['c'][3];
          upcomingServiceRow.stateByDays = fed['c'][4];
          upcomingServiceRow.description = fed['c'][5];
          upcomingServiceRow.frequency = fed['c'][6];
          upcomingServiceRow.notes = fed['c'][7];

          upcomingServiceData.upcomingServices.push(upcomingServiceRow);
      }

      upcomingServiceData.upcomingServicesCount = upcomingServiceData.upcomingServices.length;
  }
  return upcomingServiceData;
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
          if (table.name == 'unit_maintenance') {              
              reportData.upcomingServiceHeaders = table['header'];              
              reportData.upcomingServiceTotal = table['total'];
          }
        }

        // getting result from wialon
        await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('upcomingServiceHeaders')
                    && reportData.upcomingServiceHeaders!=null) {
                reportData.upcomingServiceRows = reportDataOutput[0];
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getUpcomingMaintenance getReportOutput err = ", err);    
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
      "n": "Upcoming Maintenance Report",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_upcoming_maintenance",
          "l": "Upcoming maintenance",
          "f": 16,
          "c": "[\"service_interval\",\"state\",\"state_by_mileage\",\"state_by_engine_hours\",\"state_by_days\",\"description\",\"recurrence\",\"dummy\"]",
          "cl": "[\"Service interval\",\"State\",\"State by mileage\",\"State by engine hours\",\"State by days\",\"Description\",\"Frequency\",\"Notes\"]",
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
    console.log("getUpcomingMaintenance generateTemplate err = ", err);    
    if(err && err == 'WIALONTIMEOUT') reject(err);
    reject('WIALONAPIERROR');
    });
  });
}

export default {
  getUpcomingMaintenance
};