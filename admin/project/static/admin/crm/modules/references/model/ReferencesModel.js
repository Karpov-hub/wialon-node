Ext.define("Crm.modules.references.model.ReferencesModel", {
  extend: "Crm.classes.DataModel",

  collection: "references_report",
  idField: "id",
  removeAction: "remove",

  mixins: ["Crm.modules.downloadFunctions.model.downloadFunctions"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "route_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "routes",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          report_name: 1,
          id: 1
        }
      }
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "file_id",
      type: "array",
      itemsType: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "file_name",
      type: "array",
      itemsType: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "lang",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, callback) {
    let me = this;
    if (!data || !data.length) return callback(data);

    const files_id = data.map((item) => item.file_id).flat();
    if (!files_id || !files_id.length) return callback(data);
    const allFiles = {};
    const res = await this.src.db
      .collection("providers")
      .findAll({ code: { $in: files_id } }, {});
    res.forEach((item) => {
      allFiles[item.code] = item;
    });
    data = data.map((item) => {
      let files = [];
      if (item.file_id) {
        item.file_id.forEach((id) => {
          if (allFiles[id]) files.push(allFiles[id]);
        });
        item.file_id = files;
      }
      return item;
    });

    data = await Promise.all(
      data.map(async (item) => {
        item.hash = await me.createHash(
          process.env.SECRET_KEY + me.user.profile._id
        );
        return item;
      })
    );

    callback(data);
  }
});
