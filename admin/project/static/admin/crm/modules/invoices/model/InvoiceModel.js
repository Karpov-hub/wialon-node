/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 14 April 2020
 * @private
 */
Ext.define("Crm.modules.invoices.model.InvoiceModel", {
  extend: "Core.data.DataModel",

  collection: '"invoices"',
  idField: "id",
  removeAction: "remove",

  
  mixins: ["Crm.modules.downloadFunctions.model.downloadFunctions"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "adjustment",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "total_fees",
      type: "float",
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
      name: "invoice_date",
      type: "date",
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
    }]



    /* scope:server */
  , beforeSave: function (data, cb) {
      var me=this;
      [
        function(next){
          if(data && data.id) {
            var sql = "select id,total_fees,adjustment from invoices where id=$1";
            me.src.db.query(sql, [data.id], function (err, res) {
              if (err) {
                console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
                cb({ success:false,error: { message: "Database failure,Please try again." } });
              } else if (res && res.length) {
                me.invoiceData=res[0];
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
        function(next){
          if(data && data.updateFlag) {
            me.invoiceData.total_fees+=(-(parseInt(me.invoiceData.adjustment || 0)));
            me.invoiceData.total_fees+=parseInt(data.adjustment || 0);
            data.total_fees=me.invoiceData.total_fees;
          }
          next();   
        },
        function(){
          if(data && data.updateFlag) {
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
      'adjustment': 'Adjustment',
      // 'total_fees': 'Total Fees',
      // 'invoice_date': 'Invoice Date',
      'organization_id': 'Organization '
    };

    if(reqData && reqData.updateFlag && !reqData.id){
      requiredFields['id']='Invoice Id';
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

  /* scope:server */
  ,trimData(reqData,cb){
    for(var key in reqData){
      if(key && reqData[key] && typeof(reqData[key]) == "string"){
        reqData[key]=reqData[key].toString().trim();
      }
    }
    cb()
  }

    /* scope:server */
  , getData: function (params, cb) {
    var me = this, userFlag = false;
    var util = Ext.create('Crm.Utils.Util', { scope: me });
    params._filters = params._filters ? params._filters : params.filters;
    params.customFilters = {
      eq: ["id",'organization_id'],
      numberFilters: ["adjustment",'total_fees'],
      ilike: ["name","email"],
      timeFilters: ['invoice_date','mtime'],
      foreignFilters: [
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
      } else if (params._sorters[0]._property == "adjustment" ||
        params._sorters[0]._property == "total_fees" ||
        params._sorters[0]._property == "invoice_date") {
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


  /* scope:server */
  ,$getInvoiceDetails :function (data,cb){
    var me=this;
    const Queue = require("@lib/queue");
    async function getInvoiceDetails(invoiceId,cb){
      const res = await Queue.newJob("auth-service", {
        method:"getInvoiceDetails",
        data:{ 
          "invoiceId": invoiceId,
          "lang": "EN"
        },
        realmId:"",
        userId:"",
        scope: "admin"
      });
      if (res.error) {
        cb(res);
      } else {
        cb(res.result.invoice);
      }
    }
    getInvoiceDetails(data.invoiceId,cb);
  }


  /* scope:server */
  ,$downloadInvoice :function (data,cb){
    var me=this;
    const Queue = require("@lib/queue");
    async function downloadInvoice(invoiceId,cb){
      const res = await Queue.newJob("auth-service", {
        method:"downloadInvoice",
        data:{ 
          "invoiceId": invoiceId,
          "lang": "EN"
        },
        realmId:"",
        userId:"",
        scope: "admin"
      });
      if (res.error) {
        cb(res);
      } else {
        cb(res.result.res);
      }
    }
    downloadInvoice(data.invoiceId,cb);
  }

  /* scope:server */
  ,$downloadUsageReport :function (data,cb){
    var me=this;
    const Queue = require("@lib/queue");
    async function downloadUsageReport(invoiceId,userId,cb){
      const res = await Queue.newJob("auth-service", {
        method:"downloadUsageReport",
        data:{ 
          "invoiceId": invoiceId,
          "lang": "EN"
        },
        realmId:"",
        userId:userId||"",
        scope: "admin"
      });
      if (res.error) {
        cb(res);
      } else {
        cb(res.result.res);
      }
    };
    [
      function(next){
        var sql=
        ` select id from users where  organization_id=$1 
          and role_id in (SELECT id from roles where role 
          ILIKE '%admin%' limit 1);
        `;
        me.src.db.query(sql,[data.organization_id],
          function (err, resData) {
            if(err){
              cb({error:"Database Failure"});
            }else if(resData && resData.length){
              next(resData[0].id);
            }else{
              cb({error:"Admin user not found for this organization."});
            }
        })
      },
      function(userId){
        downloadUsageReport(data.invoiceId,userId,cb);
      },
    ].runEach();
  }
  

});
