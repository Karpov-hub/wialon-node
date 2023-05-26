Ext.define("Crm.modules.permissions.model.PermissionsWriteModel", {
  extend: "Core.data.DataModel",

  collection: '"Permissions"',
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
      name: "organization_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "route_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "role_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_permissible",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
