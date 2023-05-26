Ext.define("Crm.modules.cards.model.CardsModel", {
  extend: "Crm.classes.DataModel",
  removeAction: "remove",

  collection: "cards",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "removed",
      type: "integer",
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
    },
    {
      name: "card_number",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "organization_id",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: false,
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
      name: "organization_aggregator_account_id",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: false,
      bindTo: {
        collection: "organization_aggregator_accounts",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          id: 1,
          api_key: 1,
          password: 1,
          login: 1,
          contract_number: 1,
          name: 1
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
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          email: 1,
          id: 1
        }
      }
    },
    {
      name: "signobject",
      type: "jsonb",
      filterable: true,
      visible: true,
      editable: false
    }
  ]
});
