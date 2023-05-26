Ext.define("Crm.modules.logsForApi.model.LogsForApiModel", {
    extend: "Crm.classes.DataModel",

    collection: "logs_for_api",
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
            filterable: true,
            editable: false,
            visible: true,
            bindTo: {
                collection: "users",
                keyFieldType: "ObjectID",
                keyField: "id",
                fields: {
                  login: 1,
                  email: 1,
                  id: 1
                }
            }
        },
        {
            name: "action",
            type: "string",
            filterable: true,
            editable: false,
            visible: true
        },
        {
            name: "message",
            type: "text",
            filterable: true,
            visible: true,
            editable: false
        },
        {
            name: "data",
            type: "text",
            filterable: false,
            visible: true,
            editable: false
        },
        {
            name: "ctime",
            type: "date",
            sort: -1,
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
            filterable: true,
            editable: false,
            visible: true
        },
        {
            name: "maker",
            type: "ObjectID",
            filterable: false,
            visible: false,
            editable: false,
        },
        {
            name: "signobject",
            type: "jsonb",
            filterable: true,
            visible: true,
            editable: false
        }
    ],

    /* scope:client */
    async getDataForExport(data, cb) {
        return new Promise((resolve, reject) => { 
            this.runOnServer("getDataForExport", { filters: data }, resolve);
        });
    },

    /* scope:server */
    async $getDataForExport(data, cb) {
        let filters = data.filters;
        const res = await this.src.db
            .collection("logs_for_api")
            .findAll(filters, {});
        cb(res);
        
    }
});
