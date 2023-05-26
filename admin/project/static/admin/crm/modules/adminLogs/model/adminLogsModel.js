Ext.define("Crm.modules.adminLogs.model.adminLogsModel", {
  extend: "Crm.classes.DataModel",
  collection: "admin_logs",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "data",
      type: "text",
      visible: true,
      filterable: false,
      editable: false
    },
    {
      name: "result",
      type: "text",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "date",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "admin_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true,
      bindTo: {
        collection: "admin_users",
        keyFieldType: "ObjectID",
        keyField: "_id",
        fields: {
          login: 1,
          name: 1
        }
      }
    }
  ],

  /* scope:server */
  async afterGetData(data, cb) {
    if (!data || !data.length) return cb(data);
    for (const d of data) {
      d.data = JSON.stringify(d.data);
      d.result = JSON.stringify(d.result);
    }
    cb(data);
  }
});
