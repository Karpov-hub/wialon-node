Ext.define("Crm.modules.support.model.SupportModel", {
  extend: "Core.data.DataModel",

  collection: "tickets",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "number_of_ticket",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "title",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "category",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "new",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    }
  ],

  /* scope:client */
  getCount(cb) {
    this.runOnServer("getCount", {}, cb);
  },

  /* scope:server */
  async $getCount(data, cb) {
    const res = await this.src.db
      .collection("tickets")
      .findAll({ status: 0, removed: 0 }, {});
    cb({ count: res ? res.length : 0 });
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
  }
});
