/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define("Crm.modules.wialonAccounts.model.WialonAccountsModel", {
  extend: "Core.data.DataModel",

  collection: '"wialon_accounts"',
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wialon_username",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wialon_token",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wialon_hosting_url",
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
      name: "mtime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /*
        @author: Vaibhav Mali
        @date: 12 March 2020
        @function: beforeSave.
    */
  /* scope:server */
  beforeSave: function(data, cb) {
    var me = this;
    [
      function(next) {
        if (data && data.id) {
          var sql = "select id from wialon_accounts where id=$1";
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
      function(next) {
        //Validations
        me.validateRequest(data, function(errors) {
          if (errors && errors.length) {
            cb({ success: false, validationErrors: errors });
          } else {
            next();
          }
        });
      },
      function() {
        cb(data);
      }
    ].runEach();
  },

  /* scope:server */
  validateRequest: function(reqData, cb) {
    var me = this;
    var errors = [],
      requiredFields = {
        wialon_username: "Wialon Username",
        wialon_token: "Wialon Token",
        wialon_hosting_url: "Wialon Hosting URL",
        organization_id: "Organization "
      };

    if (reqData && reqData.updateFlag && !reqData.id) {
      requiredFields["id"] = "Wialon Account Id";
    }
    for (var key in requiredFields) {
      if (
        !reqData ||
        !reqData[key] ||
        (reqData && reqData[key] == undefined) ||
        (reqData[key] && reqData[key].toString().trim() == "")
      ) {
        errors.push({
          field: key,
          message: requiredFields[key] + " field is required."
        });
      }
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

  /*
        @author: Vaibhav Mali
        @date: 12 March 2020
        @function: getData.
    */
  /* scope:server */
  getData: function(params, cb) {
    var me = this,
      userFlag = false;
    if (params.user_id) {
      me.user_id = params.user_id;
    }
    var util = Ext.create("Crm.Utils.Util", { scope: me });
    params._filters = params._filters ? params._filters : params.filters;
    params.customFilters = {
      eq: ["id", "organization_id"],
      numberFilters: ["is_active"],
      ilike: ["wialon_username", "wialon_token", "wialon_hosting_url"],
      timeFilters: ["mtime"],
      foreignFilters: [
        {
          collection: "organizations",
          alias: "o",
          eq: [],
          eqCopy: [],
          numberFilters: [],
          numberFiltersCopy: [],
          timeFilters: [],
          timeFiltersCopy: [],
          ilike: ["organization_name"],
          ilikeCopy: ["organization_id"],
          on: " o.id=ip.organization_id ",
          join: " inner join "
        }
      ]
    };
    params.sqlPlaceHolders = [];
    params.collection = me.collection;
    params.buildWhereSql = "";
    if (params && params._sorters && params._sorters.length) {
      if (params._sorters[0]._property == "organization_name") {
        params.orderQuery =
          " order by o." +
          params._sorters[0]._property +
          " " +
          params._sorters[0]._direction;
      } else if (
        params._sorters[0]._property == "wialon_username" ||
        params._sorters[0]._property == "wialon_token" ||
        params._sorters[0]._property == "wialon_hosting_url"
      ) {
        params.orderQuery =
          " order by ip." +
          params._sorters[0]._property +
          " " +
          params._sorters[0]._direction;
      } else {
        params.orderQuery = " order by ip.mtime desc";
      }
    } else {
      params.orderQuery = " order by ip.mtime desc";
    }
    util.fetchData(params, function(data) {
      data.list.forEach(function(r) {
        delete r.pass;
      });
      me.afterGetData(data, cb);
    });
  },

  /* scope:server */
  afterGetData: function(data, cb) {
    cb(data);
  }
});
