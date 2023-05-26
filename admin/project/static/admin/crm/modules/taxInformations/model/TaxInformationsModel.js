/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 17 April 2020
 * @private
 */
Ext.define("Crm.modules.taxInformations.model.TaxInformationsModel", {
  extend: "Core.data.DataModel",

  collection: "tax_informations",
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
      name: "from_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "to_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "percentage",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "mtime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  beforeSave: function(data, cb) {
    var me = this;
    [
      (function(next) {
        if (data && data.id) {
          var sql = "select id from users where id=$1";
          me.src.db.query(sql, [data.id], function(err, res) {
            if (err) {
              console.log("Fn:$beforeSave Error: " + JSON.stringify(err));
              cb({
                success: false,
                error: { message: "Database failure,Please try again." }
              });
            } else if (res && res.length) {
              data.updateFlag = true;
              next();
            } else {
              data.updateFlag = false;
              next();
            }
          });
        } else {
          data.updateFlag = false;
          next();
        }
      },
      function() {
        //Validations
        me.validateRequest(data, function(errors) {
          if (errors && errors.length) {
            cb({ success: false, validationErrors: errors });
          } else {
            data.from_date = new Date(data.from_date);
            data.to_date = new Date(data.to_date);
            cb(data);
          }
        });
      })
    ].runEach();
  },

  /* scope:server */
  validateRequest: function(reqData, cb) {
    var me = this;
    var errors = [],
      requiredFields = {
        from_date: "From Date",
        to_date: "To Date",
        percentage: "Tax Percentage"
      };
    if (reqData && reqData.updateFlag && !reqData.id) {
      requiredFields["id"] = "Tax Id";
    }
    for (var key in requiredFields) {
      if (
        !reqData ||
        (reqData &&
          (reqData[key] == undefined ||
            (reqData[key] && reqData[key].toString().trim() == "")))
      ) {
        errors.push({
          field: key,
          message: requiredFields[key] + " field is required."
        });
      }
    }
    if (new Date(reqData["from_date"]) > new Date(reqData["to_date"])) {
      errors.push({
        field: "from_date",
        message: "From Date should not be greater than To Date."
      });
    }
    if (parseFloat(reqData["percentage"]) < 0) {
      errors.push({
        field: "percentage",
        message: "Tax percentage should be greater than or equal to zero(>=0)."
      });
    }
    console.log("errors: " + errors.length);
    this.trimData(reqData, function() {
      return cb(errors);
    });
  },

  /* scope:server */
  trimData(reqData, cb) {
    for (var key in reqData) {
      if (key && reqData[key] && typeof reqData[key] == "string") {
        reqData[key] = reqData[key].toString().trim();
      }
    }
    cb();
  },

  /* scope:server */
  getData: function(params, cb) {
    var me = this,
      userFlag = false;
    var util = Ext.create("Crm.Utils.Util", { scope: me });
    params._filters = params._filters ? params._filters : params.filters;
    params.customFilters = {
      eq: ["id"],
      numberFilters: ["percentage"],
      ilike: [],
      timeFilters: ["mtime", "from_date", "to_date"],
      foreignFilters: []
    };
    params.sqlPlaceHolders = [];
    params.collection = me.collection;
    params.buildWhereSql = "";
    if (params && params._sorters && params._sorters.length) {
      params.orderQuery =
        " order by ip." +
        params._sorters[0]._property +
        " " +
        params._sorters[0]._direction;
    } else {
      params.orderQuery = " order by ip.to_date desc";
    }
    util.fetchData(params, function(data) {
      data.list.forEach(function(r) {
        delete r.pass;
      });
      cb(data);
    });
  }
});
