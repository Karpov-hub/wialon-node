/**
 * @author Ivan Danilenko
 * @scope Server
 * @Date 29 December 2021
 */
Ext.define("Crm.modules.certainPermissions.model.CertainPermissionsModel", {
  extend: "Core.data.DataModel",

  collection: "certain_permissions",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: false,
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
      editable: true,
      visible: true
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
      type: "number",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "signobject",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: false,
      editable: true,
      visible: true,
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
      name: "allow_user",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type_restriction",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  checkUnique(data, cb) {
    this.runOnServer("checkUnique", data, (res) => {
      return cb(res);
    });
  },

  /* scope:server */
  async $checkUnique(data, cb) {
    try {
      const res = await this.dbCollection.findOne({
        route_id: data.route_id,
        user_id: data.user_id,
        id: { $ne: data.id },
        type_restriction: data.type_restriction
      });
      if (res && res.id) {
        return cb({
          success: false,
          message: "This permission for passed user and route already exist."
        });
      } else if (res == null) {
        return cb({ success: true });
      }
    } catch (err) {
      console.error(
        "File: CertainPermissionsModel, fuction: $checkUnique. Unxpected error: ",
        err
      );
      return cb({
        success: false,
        message: "Something went wrong. Please, contact to Dev Group."
      });
    }
  }
});
