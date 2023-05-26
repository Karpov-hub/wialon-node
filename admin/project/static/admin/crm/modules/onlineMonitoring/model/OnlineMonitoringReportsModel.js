Ext.define("Crm.modules.onlineMonitoring.model.OnlineMonitoringReportsModel", {
    extend: "Crm.classes.DataModel",
    // collection: "users",
    strongRequest: true,
    fields: [
      {
        name: "user_id",
        type: "string",
        filterable: false,
        editable: false,
        visible: true
      },
      {
        name: "report_id",
        type: "string",
        filterable: false,
        editable: false,
        visible: true
      }
    ],

    /* scope:server */
   async getData (params, cb) {
    let me = this;
    try {
      let finalArray = [];
      const { result } = await this.src.queue.requestOne("report-service", {
          method: "getReportsInProcess",
          data: {},
          realmId: null,
          userId: null
        });
        if (result && result.reports && result.reports.length > 0){
          let convertStringToArray = result.reports.split(";");
          if (result && result.success && result.reports != null && result.reports && result.reports.length){
            [
              function(next){
                let sqlUsers = 'select name as user_name, email, id from users where id in (';
                let sqlReports = `select report_name, report_id from routes
                where report_name is not null and report_id in (`;
                for (let i = 0; i < convertStringToArray.length; i++){
                  let userIdAndReportId = convertStringToArray[i].split(":");
                  if (i != convertStringToArray.length - 1){
                    sqlUsers += '\'' + userIdAndReportId[0] + '\',';
                    sqlReports += '\'' + userIdAndReportId[1] + '\',';
                  } else {
                    sqlUsers += '\'' + userIdAndReportId[0] + '\')';
                    sqlReports += '\'' + userIdAndReportId[1] + '\')';
                  }
                  finalArray.push({
                    user_name: userIdAndReportId[0],
                    report_id: userIdAndReportId[1]
                  });
                }
                sqlUsers += " and removed = $1;"
                sqlReports += " and removed = $1;"
                let sqlPlaceHolderUsers = [0];
                let sqlPlaceHolderReports = [0];
                return next(sqlUsers, sqlReports, sqlPlaceHolderUsers, sqlPlaceHolderReports);
              },
              function(sqlUsers, sqlReports, sqlPlaceHolderUsers, sqlPlaceHolderReports, next){
                me.src.db.query(sqlUsers, sqlPlaceHolderUsers, function(err, resp){
                  if (err){
                    console.log(`Func getData, file: OnlineMonitoringUsersModel. 
                    Error while try to fetch data about users.
                    Error details:`, err);
                    return cb({list: finalArray, total: finalArray.length});
                  } else if (resp && resp.length == 0){
                    return cb({list: finalArray, total: finalArray.length});
                  } else if (resp && resp.length && resp.length > 0) {
                    return next(sqlReports, sqlPlaceHolderReports, resp);    
                  }
                });
              },
              function(sqlReports, sqlPlaceHolderReports, usersData, next){
                me.src.db.query(sqlReports, sqlPlaceHolderReports, function(err, resp){
                  if (err){
                    console.log(`Func getData, file: OnlineMonitoringUsersModel. 
                    Error while try to fetch data about report.
                    Error details:`, err);
                    return cb({list: finalArray, total: finalArray.length});
                  } else if (resp && resp.length == 0){
                    return cb({list: finalArray, total: finalArray.length});
                  } else if (resp && resp.length && resp.length > 0) {
                    return next(usersData, resp);    
                  }
                });
              },
              function(usersData, reportsData){
                for (let i = 0; i < usersData.length; i++){
                  for (let j = 0; j < finalArray.length; j++){
                    if (usersData[i].id == finalArray[j].user_name){
                      finalArray[j].user_name = usersData[i].user_name;
                      finalArray[j].email = usersData[i].email;
                      break;
                    }
                  }
                }
                for (let i = 0; i < reportsData.length; i++){
                  for (let j = 0; j < finalArray.length; j++){
                    if (reportsData[i].report_id == finalArray[j].report_id){
                      finalArray[j].report_id = reportsData[i].report_name;
                      break;
                    }
                  }
                }
                return cb({list: finalArray, total: finalArray.length});
              }
            ].runEach();
          } else {
            return cb({list:[], total: 0});
          } 
        } else {
          return cb({list: finalArray, total: finalArray.length});
        }
      } catch(e){
        console.log("Unexpected error. Func: getData, file: OnlineMonitoringReportsModel. Error:", e);
        return cb({list:[], total: 0});
      }
    }
} )