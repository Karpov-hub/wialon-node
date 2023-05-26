Ext.define("Crm.modules.aggregators.model.AggregatorsModel", {
    extend: "Crm.classes.DataModel",

    collection: "aggregators",
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
            name: "name_for_custom_field",
            type: "string",
            filterable: true,
            editable: true,
            visible: true
        },
        {
            name: "api_key_required",
            type: "boolean",
            filterable: true,
            editable: true,
            visible: true
        },
        {
            name: "log_pas_required",
            type: "boolean",
            editable: true,
            visible: true
        },
        {
            name: "contract_number_required",
            type: "boolean",
            editable: true,
            visible: true
        },
        {
            name: "name_for_custom_field",
            type: "string",
            filterable: true,
            editable: true,
            visible: true
        },
        {
            name: "host",
            type: "string",
            filterable: true,
            visible: true,
            editable: true
        },
        {
            name: "method_for_check",
            type: "string",
            filterable: true,
            visible: true,
            editable: true
        },
        {
            name: "method_for_get_data",
            type: "string",
            filterable: true,
            visible: true,
            editable: true
        },
        {
            name: "service_for_method",
            type: "string",
            filterable: true,
            visible: true,
            editable: true
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
            name: "signobject",
            type: "jsonb",
            filterable: true,
            visible: true,
            editable: true
        }
    ]
});
