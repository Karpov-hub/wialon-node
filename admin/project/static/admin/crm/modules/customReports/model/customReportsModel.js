Ext.define("Crm.modules.customReports.model.customReportsModel", {
  extend: "Crm.classes.DataModel",

  collection: "custom_report_requests",
  idField: "id",


  mixins: ["Crm.modules.downloadFunctions.model.downloadFunctions"],

  // removeAction: "remove",

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
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "attachment_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "html",
      type: "string",
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
    }
  ]

  // async afterGetData(data, callback) {
  //   if (!data || !data.length) return callback(data);

  //   const transporters_id = data.map(item => item.transporter).flat();
  //   if (!transporters_id || !transporters_id.length) return callback(data);

  //   const res = await this.src.db
  //     .collection("transporters")
  //     .findAll({ id: { $in: transporters_id } }, {});

  //   for (transport of res) {
  //     data = data.map(item => {
  //       if (item.transporter == transport.id)
  //         item.transporter = transport.host_transporter;
  //       return item;
  //     });
  //   }

  //   callback(data);
  // }
});
