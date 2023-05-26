Ext.define("Crm.modules.customreports.model.ReportsModel", {
    extend: "Core.data.DataModel",
  
    collection: "customreports",
    idField: "id",
    removeAction: "remove",
    // strongRequest: true,
    fields: [
        {
            name: "id",
            type: "ObjectID",
            filterable: false,
            editable: true,
            visible: true
        },
        {
            name: "owner",
            type: "ObjectID",
            filterable: false,
            editable: true,
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
            name: "description",
            type: "string",
            filterable: true,
            editable: true,
            visible: true
          },
          {
            name: "code",
            type: "string",
            filterable: false,
            editable: true,
            visible: true
          },
          {
            name: "docker_id",
            type: "string",
            filterable: true,
            editable: true,
            visible: true
          },
          {
            name: "ctime",
            type: "date",
            filterable: true,
            editable: false,
            visible: true
          },
          {
            name: "mtime",
            type: "date",
            filterable: true,
            editable: true,
            visible: true
          },
          {
            name: "maker",
            type: "ObjectID",
            filterable: false,
            editable: false,
            visible: true
          }
    ]
    
    /* scope:server */
    // ,getData:function(params, cb){
    //     const folder = '../reports/';
    //     const fs = require('fs');
    //     let responseArrayData = {};
    //     responseArrayData.list = [];
    //     fs.readdir(folder, (err, files) => {
    //         files.forEach(file => {
    //             responseArrayData.list.push({id: file});
    //         });
    //     });
    //     return cb(responseArrayData);
    // }
});
  