/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 05 March 2020
 * @private
 */
Ext.define("Crm.modules.routes.model.RoutesModel", {
  extend: "Core.data.DataModel",

  collection: "routes",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "method",
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
    },
    {
      name: "organization_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "requirements",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "service",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "report_id",
      type: "ObjectID",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "jasper_report_code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "formats",
      type: "array",
      itemsType: "string",
      filterable: false,
      editable: true,
      visible: true
    }
  ]
});
