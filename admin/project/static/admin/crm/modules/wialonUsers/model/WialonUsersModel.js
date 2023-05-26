/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define("Crm.modules.wialonUsers.model.WialonUsersModel", {
  extend: "Core.data.DataModel",

  collection: '"users"',
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "pass",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "organization_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "role_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "mtime",
      type: "date",
      sort:-1,
      filterable: true,
      editable: true,
      visible: true
    }, 
    {
      name: "is_blocked_by_admin",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },]


    /*
        @author: Vaibhav Mali
        @date: 12 March 2020
        @function: beforeSave.
    */
    /* scope:server */
  , beforeSave: function (data, cb) {
      var me=this;
      [
        function(next){
          if(data && data.id) {
            var sql = "select id from users where id=$1";
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
          //Adding default user realm and user role.
          if(data && data.updateFlag) {
            next();
          } else {
            [
              function(roleNext){
                var sql = "select id from roles where role ilike $1";
                me.src.db.query(sql, [me.config.userInfo.roleLabel], function (err, res) {
                  if (err) {
                    console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
                    cb({ success:false,error: { message: "Database failure,Please try again." } });
                  } else if (res && res.length) {
                    data.role_id = res[0].id;
                    roleNext();
                  } else {
                    cb({ success:false,error: { message: "System configured default user role in not found in database." } });
                  }
                })
              },
              function(){
                var sql = "select id from realms where token=$1";
                me.src.db.query(sql, [me.config.userInfo.realmToken], function (err, res) {
                  if (err) {
                    console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
                    cb({ success:false,error: { message: "Database failure,Please try again." } });
                  } else if (res && res.length) {
                    data.realm = res[0].id;
                    next();
                  } else {
                    cb({ success:false,error: { message: "System configured default user Realm in not found in database." } });
                  }
                })
              }
            ].runEach();
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
        function(next){
          //Send Mail of credentials
          if(data && data.updateFlag && !data.pass){
            if(data.pass!=undefined){
              delete data.pass;
            }
            next();
          }else{
            var Util = Ext.create('Crm.Utils.Util', {scope: me});
            var password="",text;
            if(data && data.updateFlag){
              password=data.pass;
              data.pass=Util.encrypt(data.pass);
              text="We have changed your account credentials,please check below credentials: ";
            }else{
              password=Util.generateRandomString(8);
              text="We have created account for you,please check below credentials: ";
              data.pass=Util.encrypt(password);
            }
            var Mailer = Ext.create('Crm.Email.mailer', {scope: me});
            Mailer.sendEmail({
              to: data.email,
              subject: "Wialon | Account Details",
              templateData: {
                name: data.name,
                email: data.email,
                base_url: me.config.frontUrl,
                password: password,
                text: text
              },
              templateId: 'PasswordCredentials'
            }, function (err, data) {
              if (err) {
                console.log("Error: " + err.message)
              }
              next();
            });
          }
        },
        function(){
          if(data && data.updateFlag) {
            delete data.email;
            delete data.organization_id;
          }
          cb(data);
        }
    ].runEach();
  }

  /* scope:server */
  ,validateRequest:function(reqData,cb){
    var me=this;
    var errors = [], requiredFields = {
      'name': 'Name',
      'email': 'Email',
      'role_id': 'Role',
      'organization_id': 'Organization ',
      'pass':'Password'
    };

    if(reqData && reqData.updateFlag && !reqData.id){
      requiredFields['id']='User Id';
    }
    for (var key in requiredFields) {
      if(key=="pass"){
        if(reqData.pass && !(reqData && reqData[key] && 
              reqData[key].toString().trim().length==8 )){        
            errors.push({
              field: key, message: requiredFields[key] + ' is invalid(Password length should be 8 characters).'
            })
        }
      }
      else if (!reqData || !reqData[key] || (reqData && (reqData[key] == undefined) || (reqData[key] && reqData[key].toString().trim() == ""))) {
        errors.push({
          field: key, message: requiredFields[key] + ' field is required.'
        })
      }else{
        var nameValidator=/[A-Za-z]*$/;
        var emailValidator = /^[a-zA-Z0-9]+[a-zA-Z0-9.!#$%&*+-/=?^_{|}~]*@[a-zA-Z0-9.-]+[a-zA-Z0-9]+\.[a-zA-Z]{2,10}$/;
        if (key=="name" && !nameValidator.test(reqData[key])) {
          errors.push({
            field: key, message: requiredFields[key] + 'is invalid.'
          })
        }
        else if (key=="email" && !emailValidator.test(reqData[key])) {
          errors.push({
            field: key, message: 'Please enter email in proper format:user@example.com.'
          })
        }
      } 
    }
    console.log("errors: "+errors.length);
    this.trimData(reqData,function(){
      if(!errors.length){
        var sql = "select id from users where email ilike $1";
        if(reqData && reqData.id){
          sql+=" and id!= '"+reqData.id+"'";
        }
        me.src.db.query(sql, [reqData['email']], function (err, res) {
          if (err) {
            console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
            errors.push({
              field: 'email', message: 'Database failure,Please try again.'
            })
          } else if (res && res.length) {
            errors.push({
              field: 'email', message: 'This email already exist.'
            })
          }
          return cb(errors);
        })
      }else{
        return cb(errors);
      }
    });
  }

  /* scope:server */
  ,trimData(reqData,cb){
    for(var key in reqData){
      if(key && reqData[key] && typeof(reqData[key]) == "string"){
        reqData[key]=reqData[key].toString().trim();
      }
    }
    cb()
  }

    /*
        @author: Vaibhav Mali
        @date: 12 March 2020
        @function: getData.
    */
    /* scope:server */
  , getData: function (params, cb) {
    var me = this, userFlag = false;
    var util = Ext.create('Crm.Utils.Util', { scope: me });
    params._filters = params._filters ? params._filters : params.filters;
    params.customFilters = {
      eq: ["id",'organization_id'],
      numberFilters: ["is_active", "is_blocked_by_admin"],
      ilike: ["name","email"],
      timeFilters: ['mtime'],
      foreignFilters: [
        {
          collection: 'roles',
          alias: 'r',
          eq: [],
          eqCopy: [],
          numberFilters: [],
          numberFiltersCopy: [],
          timeFilters: [],
          timeFiltersCopy: [],
          ilike: ['role'],
          ilikeCopy: ['role_id'],
          on: ' r.id=ip.role_id ',
          join: ' inner join '
        },
        {
          collection: 'organizations',
          alias: 'o',
          eq: [],
          eqCopy: [],
          numberFilters: [],
          numberFiltersCopy: [],
          timeFilters: [],
          timeFiltersCopy: [],
          ilike: ['organization_name'],
          ilikeCopy: ['organization_id'],
          on: ' o.id=ip.organization_id ',
          join: ' inner join '
        }
      ]
    };
    params.sqlPlaceHolders = [];
    params.collection = me.collection;
    params.buildWhereSql = "";
    if (params && params._sorters && params._sorters.length) {
      if (params._sorters[0]._property == "organization_name") {
        params.orderQuery = " order by o." + params._sorters[0]._property + " " + params._sorters[0]._direction;
      } else if (params._sorters[0]._property == "role") {
        params.orderQuery = " order by r." + params._sorters[0]._property + " " + params._sorters[0]._direction;
      } else if (params._sorters[0]._property == "name" ||
        params._sorters[0]._property == "email" ||
        params._sorters[0]._property == "is_active",
        params._sorters[0]._property == "is_blocked_by_admin") {
        params.orderQuery = " order by ip." + params._sorters[0]._property + " " + params._sorters[0]._direction;
      } else {
        params.orderQuery = " order by ip.mtime desc";
      }
    } else {
      params.orderQuery = " order by ip.mtime desc";
    }
    util.fetchData(params, function (data) {
      data.list.forEach(function(r){delete r.pass;})
      cb(data);
    })
  }

});
