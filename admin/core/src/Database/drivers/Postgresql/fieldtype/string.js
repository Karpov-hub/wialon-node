/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.drivers.Mysql.fieldtype.string
 * String field.
 */
Ext.define("Database.drivers.Postgresql.fieldtype.string", {
  extend: "Database.drivers.Mysql.fieldtype.string",

  getFilterValue: function(model, filter, name, callback) {
    var f = {};
    if (filter.value == "~") {
      f[name] = { $ne: "", $like: "%" };
      return callback(f);
    }
    if (filter && filter.operator) {
      switch (filter.operator) {
        case "like":
          f[name] = { $like: "%" + filter.value + "%" };
          break;
        case "in":
          f[name] = {
            $in: Ext.isArray(filter.value) ? filter.value : [filter.value]
          };
          break;
        case "eq":
          f[name] = { $eq: filter.value };
          break;
      }
    } else f[name] = filter.value;
    callback(f);
  },

  createField: function(field, collection, db, callback) {
    var len = 4000;
    if (field.len) len = field.len;
    callback(
      "ALTER TABLE " +
        collection +
        " ADD " +
        this.getDbFieldName(field) +
        " VARCHAR(" +
        len +
        ")"
    );
  }
});
