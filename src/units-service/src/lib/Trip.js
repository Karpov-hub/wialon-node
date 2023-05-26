import moment from 'moment';
import commonMethods from "./CommonMethods";
import BytesFromWialon from './BytesFromWialon';

async function getTripDetails(requestData, realmId, userId) {  
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

  let tripAndViolationData = {};
  if (Object.keys(templateOutput).length > 0) {
      tripAndViolationData = await getTripAndViolationData(templateOutput, timezoneOffset);
      let totalInfo = await getTotalInfo(templateOutput.tripTotal);

      totalInfo.trips = templateOutput.tripRowCount;
      tripAndViolationData.total = totalInfo;
  } else {
      tripAndViolationData = await setDefaultData();
  }      
  await commonMethods.deleteTemplate(templateId, resourceId, session, bytesFromWialon);                  
  await commonMethods.logOut(session, bytesFromWialon);
  const cpuTime = process.cpuUsage(startUsage).system;
  const bytesSent = JSON.stringify(tripAndViolationData).length;

  await commonMethods.saveMobileUsage("getTripDetails", cpuTime,
    bytesSent, bytesFromWialon.Bytes, userId, requestData.wialonAccountId);
  return tripAndViolationData;
}

async function setDefaultData() {
   let tripAndViolationData = {};
   tripAndViolationData. violations = { "brake" : 0, "accelerate" : 0, "turn" : 0, "overSpeed" : 0 };
   tripAndViolationData.trips = [];
   tripAndViolationData.total = { "miles" : "0", "hours" : "0h 0m", "trips" : 0 };
   tripAndViolationData.overAllScore = 0;

   return tripAndViolationData;
}

async function getTotalInfo(tripTotal) {
  let totalInfo = {};
    let totalKms = tripTotal[5].split(' km');
    // multiply kms by 0.62137 to convert it into miles
    let miles = totalKms[0] * 0.62137;
    let kms = await number_format_short(totalKms[0]);
    let n = await number_format_short(miles);
    totalInfo.miles = n;
    totalInfo.kms = kms;
    totalInfo.hours = await getOfftime(tripTotal[4]);
    return totalInfo;
}

async function getOfftime(offtime) {
  let offtimeArr = [];
  let processedOfftime = "";

  if (offtime.includes('days')) {
      offtimeArr = offtime.split(' days '); 
      offtime = offtimeArr[1];
  } else if (offtime.includes('day')) {
      offtimeArr = offtime.split(' day '); 
      offtime = offtimeArr[1];
  }

  //HH:mm:ss
  let date = new moment(offtime, 'HH:mm:ss');

  let hours = date.get('hour');;
  let minutes = date.get('minute');

  if (offtimeArr.length > 0) {
      processedOfftime =  offtimeArr[0] + 'd ';
  }
  if (hours != "00") {
      processedOfftime = processedOfftime + hours + "h ";
  }
  processedOfftime = processedOfftime + minutes + "m";
  return processedOfftime;
}

async function number_format_short(n) {
  try {
    n = parseFloat(n);
    let n_format, suffix;
    let precision = 1;
    if (n < 900) {
        // 0 - 900      
        n_format = n.toFixed(precision);
        suffix = '';
    } else if (n < 900000) {
        // 0.9k-850k      
        n_format = (n/1000).toFixed(precision);
        suffix = 'K';
    } else if (n < 900000000) {
        // 0.9m-850m
        n_format = (n/1000000).toFixed(precision);
        suffix = 'M';
    } else if (n < 900000000000) {
        // 0.9b-850b
        n_format = (n/1000000000).toFixed(precision);
        suffix = 'B';
    } else {
        // 0.9t+
        n_format = (n/1000000000000).toFixed(precision);
        suffix = 'T';
    }
    // Remove unecessary zeroes after decimal. "1.0" -> "1"; "1.00" -> "1"
    // Intentionally does not affect partials, eg "1.50" -> "1.50"
    if (precision > 0) {
        let dotzero = '.'+  "0".repeat(precision);       
        n_format = n_format.replace(dotzero, '');
    }
    return n_format + suffix;
  } catch (err) {
    console.log("getTripDetails number_format_short err = ", err);
    throw 'WIALONPARSEERROR';
  }
}

async function getTripAndViolationData(reportData, timezoneOffset) {
  let tripAndViolationData = {};
  // setting count as '0' for all violations
  tripAndViolationData.violations = {"brake" : 0, "accelerate" : 0, 
                                      "turn" : 0, "overSpeed" : 0, "seatBelt" : 0};
  if (reportData.hasOwnProperty('violationRows') && reportData.violationRows!=null) {      
    for (const vr in reportData.violationRows) {  
      let violationType = reportData.violationRows[vr].c[0];
      let violationCount = reportData.violationRows[vr].c[1];

        if (violationType.includes('Turn') || violationType.includes('Поворот')) {
          tripAndViolationData.violations.turn = tripAndViolationData.violations.turn + violationCount;
        } else if (violationType.includes('Braking') || violationType.includes('Brake')
        || violationType.includes('Торможение')) {
          tripAndViolationData.violations.brake = tripAndViolationData.violations.brake + violationCount;
        } else if (violationType.includes('Acceleration') || violationType.includes('Ускорение')) {
          tripAndViolationData.violations.accelerate = tripAndViolationData.violations.accelerate + violationCount;
        } else if (violationType.includes('Speed') || violationType.includes('Cкорости')) {
          tripAndViolationData.violations.overSpeed = tripAndViolationData.violations.overSpeed + violationCount;
        } else if (violationType.includes('Belt')) { 
          tripAndViolationData.violations.seatBelt = tripAndViolationData.violations.seatBelt + violationCount;
        }
      }
  }

  tripAndViolationData.overAllScore = 0;

  if (reportData.hasOwnProperty('violationTotal') && reportData.violationTotal!=null) {
      let violationTotal = reportData.violationTotal[2];
      violationTotal = (violationTotal/ 6.0) * 100;
      tripAndViolationData.overAllScore = Math.round(violationTotal);
  } else {
      if (reportData.hasOwnProperty('tripRows') && reportData.tripRows!=null && reportData.tripRows.length > 0) 
          tripAndViolationData.overAllScore = 100;
  }

  tripAndViolationData.trips = [];

  if (reportData.hasOwnProperty('tripRows') && reportData.tripRows!=null && reportData.tripRows.length > 0) {         
      for (const tr in reportData.tripRows) {    
            let tripRow = reportData.tripRows[tr].c;
            let tripData = {};

            tripData.time = "";
            if (tripRow[0]['t']) {      
              let tripTimestamp = moment.utc(tripRow[0]['t'], 'YYYY-MM-DD hh:mm:ss');
              tripTimestamp = (Math.round(tripTimestamp/1000)) +  ((-1) *timezoneOffset);      
              let tripDateTime =  moment.utc(tripTimestamp*1000).format("Do MMM'YY hh:mm A");
              tripData.time = tripDateTime;
            }
            tripData.location = tripRow[1]['t'];
            tripData.speed = tripRow[6];
            tripData.kms = tripRow[5];
            let offtime = await getOfftime(tripRow[9]);
            tripData.offtime = offtime;
            tripAndViolationData.trips.push(tripData);         
      }
  }
  return tripAndViolationData;
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
          if (table.name == 'unit_trips') {
              reportData.tripHeaders = table['header'];
              reportData.tripTotal = table['total'];
          }
          if (table.name == 'unit_ecodriving') {
              reportData.violationHeaders = table['header'];
              reportData.violationTotal = table['total'];
          }
        }

        // getting result from wialon
        await commonMethods.sessionRequest(session, "/core/batch", reportDataParams, bytesFromWialon)
        .then(reportDataOutput => {                     
              /**
               * if table has 1 row 
               * check if it is tripHeaders or ecoHeaders to know what data we will be getting in result rows 
               */
              if (reportDataOutput.length == 1 && reportData.hasOwnProperty('violationHeaders') && reportData.violationHeaders!=null) {
                reportData.violationRows = reportDataOutput[0];
              } else {
                reportData.tripRows = reportDataOutput[0];
                reportData.tripRowCount = reportDataOutput[0].length;
                reportData.violationRows = (reportDataOutput[1] ? reportDataOutput[1] : []);
              }
              resolve(reportData);        
        })
        .catch(err => {
          console.log("getTripDetails getReportOutput err = ", err);
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
      "n": "Trip & Violation Report",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_trips",
          "l": "Trips",
          "f": 16,
          "c": "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"duration\",\"mileage\",\"avg_speed\",\"duration_ival\",\"duration_prev\",\"duration_next\"]",
          "cl": "[\"Beginning\",\"Initial location\",\"End\",\"Final location\",\"Duration\",\"Mileage\",\"Avg speed\",\"Total time\",\"Off-time\",\"Following off-time\"]",
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
        },
        {
          "n": "unit_ecodriving",
          "l": "Violation Count",
          "f": 4194320,
          "c": "[\"violations_count\",\"violation_rank\"]",
          "cl": "[\"Count\",\"Rank\"]",
          "cp": "[{}]",
          "p": "{\"grouping\":\"{\\\"type\\\":\\\"criterion\\\"}\",\"violation_group_name\":\"*\"}",
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
    console.log("getTripDetails generateTemplate err = ", err);
    if(err && err == 'WIALONTIMEOUT') reject(err);
     reject('WIALONAPIERROR');
   });
  });
}

export default {
  getTripDetails
};