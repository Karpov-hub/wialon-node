Ext.define("Crm.modules.organizationAggregatorAccounts.model.OrganizationAggregatorAccountPermissionsModel", {
  extend: "Crm.classes.DataModel",

  collection: "organization_aggregator_account_permissions",
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
      name: "aggregator_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "aggregators",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "maker",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: false,
      bindTo: {
        collection: "admin_users",
        keyFieldType: "ObjectID",
        keyField: "_id",
        fields: {
          login: 1,
          _id: 1
        }
      }
    },
    {
      name: "removed",
      type: "integer",
      filterable: true,
      editable: false,
      visible: true
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
      name: "mtime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: false,
      visible: true
    }
  ]
});
