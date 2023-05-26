/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 03 March 2020
 * @private
 */
Ext.define("Crm.modules.organizations.model.OrganizationsModel", {
  extend: "Core.data.DataModel",

  collection: "organizations",
  idField: "id",
  removeAction: "remove",

  oldSandboxAccessStatus: null,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "organization_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "billing_day",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true,
      sort: -1
    },
    {
      name: "is_billing_enabled",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_report_template_generator_enabled",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "sandbox_access_status",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  getCount(cb) {
    this.runOnServer("getCount", {}, cb);
  },

  /* scope:server */
  async $getCount(data, cb) {
    const res = await this.src.db
      .collection("organizations")
      .findAll({ sandbox_access_status: 2, removed: 0 }, {});
    cb({ count: res ? res.length : 0 });
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
  },

  /* scope:server */
  $getData: function(data, cb) {
    this.getData(data, cb);
  },

  /*
  @author: Vaibhav Mali
  @date: 28 Sept 2018
  @function: checkMtime.
  @desc: To check whether record has modified or not. 
  */
  /* scope:server */
  $checkMtime: function(req, cb) {
    var sql =
      "select mtime from " +
      this.dbCollection.collection +
      " where id =$1 and removed=0";
    this.src.db.query(sql, [req._id], function(e, res) {
      if (res && res.length) {
        cb(
          new Date(res[0].mtime) &&
            new Date(req.mtime) &&
            new Date(res[0].mtime) > new Date(req.mtime)
            ? true
            : false
        );
      } else {
        cb(false);
      }
    });
  },

  beforeSave: async function(data, cb) {
    const organization = await this.src.db.collection("organizations").findOne({
      id: data.id
    });

    this.oldSandboxAccessStatus = organization.sandbox_access_status;

    return cb(data);
  },

  /* scope:server */
  afterSave: async function(data, cb) {
    if (
      data &&
      data.id &&
      data.sandbox_access_status === 3 &&
      data.sandbox_access_status != this.oldSandboxAccessStatus
    ) {
      await this.src.queue.requestOne("auth-service", {
        method: "notifyOrganizationAdminsAboutAccessToSandbox",
        data: {
          organization_id: data.id
        }
      });
    }
    cb(data);
  }
});
