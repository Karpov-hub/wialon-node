Ext.define("Crm.modules.support.model.CommentModel", {
  extend: "Crm.classes.DataModel",

  collection: "comments",
  idField: "id",
  // removeAction: "remove", // не нужно удалять сообщения, они будут просто отмечаться как удаленные

  mixins: ["Crm.modules.downloadFunctions.model.downloadFunctions"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "ticket_id",
      type: "ObjectID",
      editable: true,
      visible: true
    },
    {
      name: "sender",
      type: "ObjectID",
      editable: false,
      visible: true,
      bindTo: {
        collection: "vw_allusers",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          login: 1,
          type: 1,
          id: 1
        }
      }
    },

    {
      name: "file_id",
      type: "ObjectID",
      editable: true,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      editable: true,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_user_message",
      type: "string",
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "datetime",
      sort: -1,
      filterable: true,
      visible: true
    }
  ],

  /* scope:server */
  async getData(params, cb) {
    let ticketId = null;
    if (params._filters || params.filters) {
      let filters = params.filters || params._filters;
      for (let f of filters) {
        if (f._property == "ticket_id" || f.property == "ticket_id")
          ticketId = f._value || f.value;
      }
    }
    if (ticketId) {
      this.find = {
        $and: [
          {
            ticket_id: ticketId
          }
        ]
      };
    } else return cb({ total: 0, list: [] });

    this.callParent(arguments);
  },

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
      item.file_id.forEach((id) => {
        if (allFiles[id]) files.push(allFiles[id]);
      });
      item.file_id = files;
      return item;
    });
    data = await Promise.all(
      data.map(async (item) => {
        if (item.file_id && item.file_id[0]) {
          item.file_id[0].hash = await me.createHash(
            process.env.SECRET_KEY + me.user.profile._id
          );
        }
        return item;
      })
    );
    return callback(data);
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
  }
});
