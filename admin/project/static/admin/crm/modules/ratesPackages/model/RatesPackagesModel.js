/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 17 April 2020
 * @private
 */
Ext.define("Crm.modules.ratesPackages.model.RatesPackagesModel", {
  extend: "Core.data.DataModel",

  collection: '"rates_packages"',
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
      name: "package_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fixed_monthly_fees",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fixed_monthly_fees_fuc",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bytes_sent",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "cpu_time_taken",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bytes_from_wialon",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "downloads_click",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "generate_reports_click",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "no_of_employees",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "no_of_wialon_acc",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_offering_pkg",
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
    }]


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
          if(data.updateFlag){
            var requiredFields = [
              'package_name',
              'fixed_monthly_fees',
              'fixed_monthly_fees_fuc',
              'bytes_sent',
              'cpu_time_taken',
              'bytes_from_wialon',
              'downloads_click',
              'generate_reports_click',
              'no_of_employees',
              'no_of_wialon_acc'
            ];
            requiredFields.forEach(function(key){
              delete data[key];
            })
          }
          next(); 
        },
        function(){
          //Validations
          me.validateRequest(data,function(errors){
            if (errors && errors.length) {
              cb({ success:false,validationErrors: errors });
            } else {
              data.from_date=new Date(data.from_date);
              data.to_date=new Date(data.to_date);
              cb(data);  
            }
          });
        }
    ].runEach();
  }

  /* scope:server */
  ,validateRequest:function(reqData,cb){
    var me=this;
    var errors = [], requiredFields = {
      'package_name': 'Package name',
      'fixed_monthly_fees': 'Fixed monthly fees',
      'fixed_monthly_fees_fuc': 'Fixed monthly fees for FUC plugin',
      'bytes_sent': 'Bytes downloaded rate',
      'cpu_time_taken': 'CPU time taken rate',
      'bytes_from_wialon': 'Bytes received from wialon rate',
      'downloads_click':'Downloads click rate',
      'generate_reports_click':'Generate reports click rate',
      'no_of_employees': 'Number of employees rate',
      'no_of_wialon_acc':'Number of wialon accounts rate',
      'is_offering_pkg': 'Is Offering Package'
    };
    if(reqData && reqData.updateFlag && !reqData.id){
      requiredFields={
        'is_offering_pkg': 'Is Offering Package'
      }
      requiredFields['id']='Rates Package Id';
    }
    for (var key in requiredFields) {
      if (!reqData || (reqData && 
        ((reqData[key] == undefined) || (reqData[key] && reqData[key].toString().trim() == "")))) {
        errors.push({
          field: key, message: requiredFields[key] + ' field is required.'
        })
      }else{
        if(key != "package_name" && key != "is_offering_pkg" && 
          parseFloat(reqData[key]) < 0){
          errors.push({
            field: key, message: requiredFields[key]+' should be greater than or equal to zero(>=0).'
          })
        }
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
    var me = this;
    var util = Ext.create('Crm.Utils.Util', { scope: me });
    params._filters = params._filters ? params._filters : params.filters;
    params.customFilters = {
      eq: ["id"],
      numberFilters: [
        'fixed_monthly_fees',
        'fixed_monthly_fees_fuc',
        'bytes_sent',
        'cpu_time_taken',
        'bytes_from_wialon',
        'downloads_click',
        'generate_reports_click',
        'no_of_employees',
        'no_of_wialon_acc',
        'is_offering_pkg'
      ],
      ilike: ['package_name'],
      timeFilters: ['mtime'],
      foreignFilters: []
    };
    params.sqlPlaceHolders = [];
    params.collection = me.collection;
    params.buildWhereSql = "";
    if (params && params._sorters && params._sorters.length) {
      params.orderQuery = " order by ip." + params._sorters[0]._property + " " + params._sorters[0]._direction;
    } else {
      params.orderQuery = " order by ip.mtime desc";
    }
    util.fetchData(params, function (data) {
      data.list.forEach(function(r){delete r.pass;})
      cb(data);
    })
  }

  /* scope:server */
  ,$savePackageInOrganization: function (data, cb) {
    var me=this,sql="";
    [
      function(next){
        //Organization validation
        if(data && data.organization_id){
          data.organization_id=data.organization_id.toString().trim();
          sql=`select id from organizations where id=$1;`;
          me.src.db.query(sql,[data.organization_id],
            function (err, resData) {
              if(err){
                console.log("Database Failure: model: RatesPackagesModel fn $savePackageInOrganization() :"+JSON.stringify(err));
                return cb({error:{message:"Database failure."}});
              }else if(resData && resData.length){
                next();
              }else{
                return cb({error:{message:"Please provide valid organization Id"}});
              }
          })
        }else{
          return cb({error:{message:"Please provide organization Id"}});
        } 
      },
      function(next){
        //selected package validation
        if(data && data.selectedPackages && data.selectedPackages.length){
          if(data.selectedPackages.length>1){
            return cb({error:{message:"Please provide single package to assign organization."}});
          }else{
            next(data.selectedPackages[0]);
          }
        }else{
          return cb({error:{message:"Please provide package to assign organization."}});
        }
      },
      function(ratePackageId,next){
        me.ratePackageId=ratePackageId;
        //Getting current selected info
        var sql=
        ` select id,rates_package_id,from_date from package_subscriptions 
          where organization_id=$1 and to_date is NULL
          order by ctime desc;
        `;
        me.src.db.query(sql,[data.organization_id],
          function (err, resData) {
            if(err){
              console.log("Database Failure: model: RatesPackagesModel fn $savePackageInOrganization() :"+JSON.stringify(err));
              return cb({error:{message:"Database failure."}});
            }else if(resData && resData.length){
              next(resData[0]);
            }else{
              next(null);
            }
        })
      },
      function(packageSub,next){
        //Check whether current package already assigned or not.
        if(packageSub){
          if(packageSub.rates_package_id==me.ratePackageId){
            return cb({error:{message:"Selected package is already assigned to this organization."}});
          }else {
            var packageSubFromDate= 
              (new Date(packageSub.from_date).getMonth()+1)+
              "-"+(new Date(packageSub.from_date).getDate())+
              "-"+(new Date(packageSub.from_date).getFullYear());
            var todaysDate= 
              (new Date().getMonth()+1)+
              "-"+(new Date().getDate())+"-"+
              (new Date().getFullYear());
            if(packageSubFromDate == todaysDate){
              next(packageSub,true);
            }else{
              next(packageSub,false);
            }
          }
        }else{
          next(null,false);
        }
      },
      function(packageSub,updatePackageFlag){
        //Updating and adding required data in PackageSubscriptionModel.
        var PackageSubscriptionModel = Ext.create('Crm.modules.ratesPackages.model.PackageSubscriptionModel', { scope: me });
        [
          function(updatePackageSubNext){
            if(packageSub){
              var writeData={id:packageSub.id}
              if(updatePackageFlag){
                writeData.rates_package_id=me.ratePackageId;
              }else{
                writeData.to_date=new Date(new Date().setDate(new Date().getDate() - 1));
              }
              PackageSubscriptionModel.write(writeData,
                function(data){
                if(data.success){
                  if(updatePackageFlag){
                    return cb({success:true});
                  }else{
                    updatePackageSubNext();
                  }
                }else{
                  console.log("Database Failure: model: RatesPackagesModel fn $savePackageInOrganization() :"+JSON.stringify(data.error));
                  return cb({error:{message:"Database failure."}});
                }
              },{modify:true})
            }else{
              updatePackageSubNext();
            }
          },
          function(){
            var writeData={
              organization_id:data.organization_id,
              rates_package_id:me.ratePackageId,
              from_date:new Date(),
              to_date:null
            }
            PackageSubscriptionModel.write(writeData,
              function(data){
              if(data.success){
                return cb({success:true});
              }else{
                console.log("Database Failure: model: RatesPackagesModel fn $savePackageInOrganization() :"+JSON.stringify(data.error));
                return cb({error:{message:"Database failure."}});
              }
            },{add:true})
          }
        ].runEach();
      }
    ].runEach();
  }

});
