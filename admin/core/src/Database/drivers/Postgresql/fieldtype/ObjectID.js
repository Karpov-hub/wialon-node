/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.ObjectID
 * @extend Database.fieldtype.Field
 * Mongodb ObjectId field
 */
const uuidV4 = require("uuid/v4");

Ext.define("Database.drivers.Postgresql.fieldtype.ObjectID", {
  extend: "Database.fieldtype.Field",

  bldBson: function(str) {
    str = str + "";
    if (/^[a-z0-9\-]{36}$/i.test(str)) {
      return str;
    }
    return null;
  },

  getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
    if (!!callback) callback(this.bldBson(value));
    else return this.bldBson(value);
  },

  getFilterValue: function(model, filter, name, callback) {
    var f = {};

    var vals = Ext.isArray(filter.value)
      ? filter.value
      : filter.value
      ? filter.value.split(",")
      : ["-"];
    if (filter && filter.operator && filter.operator == "neq") {
      f[name] = { $ne: filter.value };
    } else if (vals.length == 1) f[name] = this.bldBson(filter.value);
    else if (vals.length > 1) {
      for (var i = 0; i < vals.length; i++) {
        vals[i] = this.bldBson(vals[i]);
      }
      f[name] = { $in: vals };
    } else f = null;

    callback(f);
  },

  createNew: function(db) {
    return db.createObjectId();
  },

  createField: function(field, collection, db, callback) {
    callback(
      "ALTER TABLE " +
        collection +
        " ADD " +
        this.getDbFieldName(field) +
        " VARCHAR(36)"
    );
  }
});
