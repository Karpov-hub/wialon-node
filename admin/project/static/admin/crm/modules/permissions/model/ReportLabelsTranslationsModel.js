Ext.define("Crm.modules.permissions.model.ReportLabelsTranslationsModel", {
  extend: "Core.data.DataModel",

  collection: "report_labels",
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
      name: "report_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "lang",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "report_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
