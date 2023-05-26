/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define("Database.drivers.Postgresql.fieldtype.boolean", {
  extend: "Database.drivers.Mysql.fieldtype.boolean",

  getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
    callback(!!value);
  },

  getDisplayValue: function(model, record, name, callback) {
    callback(!!record[name]);
  },

  createField: function(field, collection, db, callback) {
    callback(
      "ALTER TABLE " +
        collection +
        " ADD " +
        this.getDbFieldName(field) +
        " BOOLEAN"
    );
  }
});
