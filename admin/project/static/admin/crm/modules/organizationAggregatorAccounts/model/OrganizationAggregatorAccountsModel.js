Ext.define("Crm.modules.organizationAggregatorAccounts.model.OrganizationAggregatorAccountsModel", {
  extend: "Crm.classes.DataModel",

  collection: "organization_aggregator_accounts",
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
      editable: false,
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
      editable: false,
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
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "api_key",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "password",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "login",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "contract_number",
      type: "string",
      filterable: true,
      editable: false,
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
      name: "signobject",
      type: "jsonb",
      filterable: true,
      visible: true,
      editable: false
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
