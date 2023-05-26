Ext.define('Crm.modules.wialonAccounts.model.LocalWialonUsersAccountsModel', {
    extend: 'Crm.modules.wialonAccounts.model.WialonAccountsModel',

  /*
      @author: Vaibhav Mali
      @date: 10 April 2020
      @function: afterGetData.
  */
  /* scope:server */
  afterGetData: function (data, cb) {
    var me=this;
    var sql="select id from wialon_account_accesses where user_id=$1 and wialon_acc_id=$2 and removed !=1"
    if(data && data.list && data.list.length && me.user_id){
      data.list.prepEach(function (acc, nextAcc) {
        me.src.db.query(sql, [me.user_id, acc.id], function (err, res) {
          if (err) {
            console.log("Model: LocalWialonUsersAccountsModel Fn:afterGetData() Error: " + JSON.stringify(err));
          }
          if (res && res.length) {
            acc.active = 1;
          } else {
            acc.active = 0;
          }
          acc.user_id = me.user_id;
          nextAcc(acc);
        })
      }, function () {
        cb(data)
      })
    }else{
      cb(data)
    }
  }

  /*
    @author: Vaibhav Mali
    @date: 10 April 2020
    @function: validateRequest.
  */
   /* scope:server */
   ,validateRequest:function(reqData,cb){
    var me=this;
    var errors = [], requiredFields = {
      'user_id':'User Id',
      'active':'Active'
    };

    if(reqData && reqData.updateFlag && !reqData.id){
      requiredFields['id']='Wialon Account Id';
    }
    for (var key in requiredFields) {
      if (!reqData || reqData[key]==undefined || (reqData && (reqData[key] == undefined) || (reqData[key] && reqData[key].toString().trim() == ""))) {
        errors.push({
          field: key, message: requiredFields[key] + ' field is required.'
        })
      }
    }
    console.log("errors: "+errors.length);
    this.trimData(reqData,function(){
      return cb(errors);
    });
  }

  /*
    @author: Vaibhav Mali
    @date: 10 April 2020
    @function: beforeSave.
  */
  /* scope:server */
  ,beforeSave: function (data, cb) {
    var me=this;
    [
      function(next){
        if(data && data.id) {
          var sql = "select id from wialon_accounts where id=$1";
          me.src.db.query(sql, [data.id], function (err, res) {
            if (err) {
              console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
              cb({ success:false,error: { message: "Database failure,Please try again." } });
            } else if (res && res.length) {
              data.updateFlag=true;                
              next();
            } else {
              data.updateFlag=false;                
              next();              
            }
          })
        }else{
          data.updateFlag=false;                
          next(); 
        }
      },
      function(next){
        //Validations
        me.validateRequest(data,function(errors){
          if (errors && errors.length) {
            cb({ success:false,validationErrors: errors });
          } else {
            next();   
          }
        });
      },
      function(){
        if(data.active){
          var sql = "select id from wialon_account_accesses where user_id=$1 and wialon_acc_id=$2 ";
          me.src.db.query(sql, [data.user_id,data.id], function (err, res) {
            if (err) {
              console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
              cb({ success:false,error: { message: "Database failure,Please try again." } });
            }
            else if(res && res.length){
              data={id:data.id}
              cb(data);
            }
            else{
              var WialonAccountsAccessModel= Ext.create('Crm.modules.wialonAccounts.model.WialonAccountsAccessModel', {scope: me});
              WialonAccountsAccessModel.write({
                user_id: data.user_id,
                wialon_acc_id: data.id,
              }, function (res) {
                if(res.error){
                  console.log("Fn:$beforeSave Error: " + JSON.stringify(res.error));
                  cb({ success:false,error: { message: "Database failure,Please try again." } });
                }else{
                  data={id:data.id}
                  cb(data);
                }
              },{add: 1})
            }
          })
        }else{
          var sql = "delete from wialon_account_accesses where user_id=$1 and wialon_acc_id=$2 ";
          me.src.db.query(sql, [data.user_id,data.id], function (err, res) {
            if (err) {
              console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
              cb({ success:false,error: { message: "Database failure,Please try again." } });
            }else{
              data={id:data.id}
              cb(data);
            }
          })
        }
      }
    ].runEach();
  }

})

    