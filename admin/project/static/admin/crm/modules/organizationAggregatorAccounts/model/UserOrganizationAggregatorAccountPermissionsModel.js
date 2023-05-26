Ext.define("Crm.modules.organizationAggregatorAccounts.model.UserOrganizationAggregatorAccountPermissionsModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_user_organization_aggregator_account_permissions",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: false,
      editable: true,
      visible: true,
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
      name: "id",
      type: "ObjectID",
      visible: true
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
