Ext.define("Crm.modules.systemVariables.model.SystemVariablesModel", {
    extend: "Core.data.DataModel",
  
    collection: "system_variables",
    idField: "id",
    removeAction: "remove",
  
    fields: [
      {
        name: "id",
        type: "ObjectID",
        visible: true,
      },
      {
        name: "code",
        type: "string",
        filterable: true,
        editable: true,
        visible: true,
      },
      {
        name: "value",
        type: "string",
        filterable: true,
        editable: true,
        visible: true,
      },
      {
        name: "maker",
        type: "ObjectID",
        visible: true,
        filterable: true,
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
        name: "ctime",
        type: "date",
        sort: -1,
        filterable: true,
        editable: false,
        visible: true,
      },
      {
          name: "mtime",
          type: "data",
          editable: false,
          visible: true,
          filterable: true
      },
      {
        name: "realm_id",
        type: "ObjectID",
        filterable: true,
        editable: true,
        visible: true,
        bindTo: {
            collection: "realms",
            keyFieldType: "ObjectID",
            keyField: "id",
            fields: {
                name: 1,
                id: 1
            }
        }
      },
      {
        name: "removed",
        type: "integer",
        filterable: true,
        editable: true,
        visible: true
      }
    ],
});
  