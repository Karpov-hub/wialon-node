Ext.define("Crm.modules.plugins.model.OrganizationPluginsModel", {
  extend: "Crm.classes.DataModel",

  collection: "organization_plugins",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "organization_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "organizations",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          organization_name: 1,
          id: 1
        }
      }
    },
    {
      name: "plugin_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "plugins",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "status",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_cron_enabled",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "reject_reason",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "plugin_fees",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "last_activated_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "last_deactivated_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "signobject",
      type: "jsonb",
      filterable: true,
      visible: true,
      editable: true
    },
    {
      name: "maker",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: false,
      bindTo: {
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          email: 1,
          id: 1
        }
      }
    },
    {
      name: "ctime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "removed",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "mtime",
      type: "date",
      sort: 1,
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
      .collection("organization_plugins")
      .findAll({ status: 1, removed: 0 }, {});
    cb({ count: res ? res.length : 0 });
  }
});
