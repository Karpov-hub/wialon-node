Ext.define("Crm.modules.accountHolders.model.UsersModel", {
  extend: "Core.data.DataModel",

  collection: "users",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "pass",
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
      editable: false,
      visible: true
    },
    {
      name: "stime",
      type: "number",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "maker",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true,
      unique: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
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
      name: "role_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "roles",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          role: 1,
          id: 1
        }
      }
    },
    {
      name: "realm",
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
      name: "signobject",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "is_active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_blocked_by_admin",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true,
      sort: -1
    },
    {
      name: "preferred_language",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "salt",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  beforeSave: async function(data, cb) {
    const util = require("@lib/utils");
    const user = await this.src.db.collection("users").findOne({
      id: data.id
    });

    if ((user && user.pass && data.pass !== user.pass) || user == null) {
      const newSalt = util.createSalt();
      data.salt = newSalt;
      data.pass = util.hashPassword(data.pass, newSalt);
    }
    return cb(data);
  },

  /* scope:client */
  checkEmail(data, cb) {
    this.runOnServer("checkEmail", data, (res) => {
      return cb(res);
    });
  },

  /* scope:server */
  async $checkEmail(data, cb) {
    try {
      const res = await this.dbCollection.findOne({
        email: data.email,
        id: { $ne: data.id }
      });
      if (res && res.id) {
        return cb({
          success: false,
          message: "This email already exist to another user."
        });
      } else if (res == null) {
        return cb({ success: true });
      }
    } catch (err) {
      console.error(
        "File: UsersModel, function: $checkEmail. Unexpected error: ",
        err
      );
      return cb({
        success: false,
        message: "Something went wrong. Please, contact to Dev Group."
      });
    }
  }
});
