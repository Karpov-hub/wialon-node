/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 17 April 2020
 * @private
 */
Ext.define("Crm.modules.ratesPackages.model.OrganizationRatesPackagesModel", {
  extend: "Crm.modules.ratesPackages.model.RatesPackagesModel",

  /* scope:server */
  getData: function (params, cb) {
    var me = this, organizationFlag = false,organizationId;
    params._filters = params._filters ? params._filters : params.filters;
    if (params && params._filters && params._filters.length > 0) {
      if (params._filters[0].property) {
        for (var i = 0; i < params._filters.length; i++) {
          params._filters[i]._property = params._filters[i]._property ? params._filters[i]._property : params._filters[i].property;
          params._filters[i]._value = params._filters[i]._value ? params._filters[i]._value : params._filters[i].value;
        }
      }
      for (var i = 0; i < params._filters.length; i++) {
        if (params._filters[i]._property == "organization_id") {
          organizationFlag = true;
          organizationId=params._filters[i]._value;
          break;
        }
      }
    }
    if (organizationFlag) {
      [
        function(next){
          var sql=
          ` select rates_package_id from package_subscriptions 
            where organization_id=$1 and to_date is NULL
            order by ctime desc;
          `;
          me.src.db.query(sql,[organizationId],
            function (err, resData) {
              if(err){
                console.log("Database Failure: model: OrganizationRatesPackagesModel fn getData() :"+JSON.stringify(err));
                return cb({ list: [], total: 0 });
              }else if(resData && resData.length){
                next(resData[0]);
              }else{
                console.log("model: OrganizationRatesPackagesModel fn getData() : Package not found for organization: "+organizationId);
                return cb({ list: [], total: 0 });
              }
          })
        },
        function(packageInfo){
          var RatesPackagesModel = Ext.create('Crm.modules.ratesPackages.model.RatesPackagesModel', { scope: me });
          params._filters.push({
            _property:'id',
            _value:packageInfo.rates_package_id,
            _operator:'eq'
          })
          RatesPackagesModel.getData(params,cb);
        }
      ].runEach();
    }
    else {
      return cb({ list: [], total: 0 });
    }
  }

});
