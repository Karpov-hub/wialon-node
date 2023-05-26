import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getServiceEntries(requestData, realmId, userId) {          
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
  let serviceEntryData = {};

  if (Object.keys(templateOutput).length > 0) {
    serviceEntryData = await getServiceEntryData(templateOutput);        
  } else {
    serviceEntryData = await setDefaultData();
  }
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);   
  await commonMethods.logOut(session, bytesFromWialon);
  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(serviceEntryData).length;
  await commonMethods.saveMobileUsage("getServiceEntries", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);

  return serviceEntryData;
}

function inputValidations(requestData) {
let fromDate = moment(new Date(requestData.fromDate)).startOf('day');
let toDate = moment(new Date(requestData.toDate)).endOf('day');
let now = moment(new Date()).endOf('day');      

if((fromDate > toDate) || (fromDate > now) || (toDate > now)) {
  throw "DATELESSTODAY";
}

return {fromDate, toDate};
}

async function setDefaultData() {
  let serviceEntryData = {};
  serviceEntryData.serviceEntries = [];
  serviceEntryData.serviceEntriesCount = 0;

  return serviceEntryData;
}

async function getServiceEntryData(reportData) {ы
  let serviceEntryData = {};
  if (reportData.hasOwnProperty('serviceEntryRows') && reportData.serviceEntryRows!=null) {
      serviceEntryData.serviceEntries = [];
      serviceEntryData.serviceEntriesCount = 0;
      for (const key in reportData.serviceEntryRows) {    
          let fed = reportData.serviceEntryRows[key];
          let serviceEntryRow = {};
          
          serviceEntryRow.serviceTime = fed['c'][0];
          serviceEntryRow.workType = fed['c'][1];
          serviceEntryRow.position = {};
          serviceEntryRow.position.name = "";
          serviceEntryRow.position.lat = 0.0;
          serviceEntryRow.position.long = 0.0;
          if (fed['c'][2]) {
            serviceEntryRow.position.name = fed['c'][2]['t'];
            serviceEntryRow.position.lat = fed['c'][2]['y'];
            serviceEntryRow.position.long = fed['c'][2]['x'];
          }
          serviceEntryRow.cost = String(fed['c'][3]);
          serviceEntryRow.kms = String(fed['c'][4]);
          serviceEntryRow.engineHours = fed['c'][5];
          serviceEntryRow.registrationTime = fed['c'][6];
          serviceEntryRow.comment = fed['c'][7];
          serviceEntryRow.duration = fed['c'][8];
          serviceEntryRow.count = String(fed['c'][9]);
          serviceEntryRow.notes = fed['c'][10];
         
          serviceEntryData.serviceEntries.push(serviceEntryRow);
      }

      serviceEntryData.serviceEntriesCount = serviceEntryData.serviceEntries.length;
  }
  return serviceEntryData;
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
              reportData.serviceEntryHeaders = table['header'];              
              reportData.serviceEntryTotal = table['total'];
          }
        }

        // getting result from wialon
        await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('serviceEntryHeaders')
                    && reportData.serviceEntryHeaders!=null) {
                reportData.serviceEntryRows = reportDataOutput[0];
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getServiceEntries getReportOutput err = ", err);
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
      "n": "Maintenance Report",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_maintenance",
          "l": "Maintenance",
          "f": 16,
          "c": "[\"time\",\"evt_text\",\"place\",\"cost\",\"mileage\",\"engine_hours\",\"recv_time\",\"comment\",\"duration\",\"events_count\",\"dummy\"]",
          "cl": "[\"Service time\",\"Kind of work\",\"Location\",\"Cost\",\"Mileage\",\"Engine hours\",\"Registration time\",\"Comment\",\"Duration\",\"Count\",\"Notes\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{},{}]",
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
      console.log("getServiceEntries generateTemplate err = ", err);
      if(err && err == 'WIALONTIMEOUT') reject(err);
      reject('WIALONAPIERROR');
    });
  });
}

export default {
  getServiceEntries
};