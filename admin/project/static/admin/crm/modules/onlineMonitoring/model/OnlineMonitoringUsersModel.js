Ext.define("Crm.modules.onlineMonitoring.model.OnlineMonitoringUsersModel", {
    extend: "Crm.classes.DataModel",
    collection: "users",
    strongRequest: true,
    fields: [
      {
        name: "id",
        type: "string",
        filterable: false,
        editable: false,
        visible: true
      },
      {
        name: "name",
        type: "string",
        filterable: false,
        editable: false,
        visible: true
      },
      {
        name: "email",
        type: "string",
        filterable: false,
        editable: false,
        visible: true
      }
    ],

    /* scope:server */
   async getData (params, cb) {
    const { result } = await this.src.queue.requestOne("auth-service", {
        method: "getLoginedUsers",
        data: {},
        realmId: null,
        userId: null
      });
      if (result && result.success && result.users && result.users.length){
        let convertStringToArray = result.users.split(";");
        let sqlString = 'select name, email, id from users where id in (';
        for (let i = 0; i < convertStringToArray.length; i++){
          let idAndToken = convertStringToArray[i].split(":");
          if (i != convertStringToArray.length - 1){
            sqlString += '\'' + idAndToken[0] + '\',';
          } else {
            sqlString += '\'' + idAndToken[0] + '\')';
          }
        }
        sqlString += " and removed = $1;"
        let sqlPlaceHolder = [0];
        this.src.db.query(sqlString, sqlPlaceHolder, function(err, resp){
          if (err){
            console.log(`Func getData, file: OnlineMonitoringUsersModel. 
            Error while try to fetch data about online users.
            Error details:`, err);
            return cb({list:[], total: 0});
          } else if (resp && resp.length == 0){
            return cb({list:[], total: 0});
          } else if (resp) {
            cb({list: resp, total: resp.length});
          }
        });
      } else {
        return cb({list:[], total: 0});
      }
   }
})