Ext.define("Crm.modules.plugins.model.PluginsModel", {
    extend: "Crm.classes.DataModel",

    collection: "plugins",
    idField: "id",

    fields: [
        {
            name: "id",
            type: "ObjectID",
            visible: true
        },
        {
            name: "name",
            type: "string",
            filterable: true,
            editable: true,
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
            name: "signobject",
            type: "jsonb",
            filterable: true,
            visible: true,
            editable: true
        },
        {
            name: "maker",
            type: "string",
            filterable: true,
            editable: false,
            visible: true,
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
            editable: true,
            visible: true
        },
        {
            name: "mtime",
            type: "date",
            sort: 1,
            filterable: true,
            editable: true,
            visible: true
        },
    ]
});
