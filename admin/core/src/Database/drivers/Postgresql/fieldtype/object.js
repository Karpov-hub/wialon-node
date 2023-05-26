/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.drivers.Mysql.fieldtype.object
 * String field.
 */
Ext.define("Database.drivers.Postgresql.fieldtype.object", {
  extend: "Database.drivers.Mongodb.fieldtype.object",

  getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
    callback(value || null);
  },

  createField: function(field, collection, db, callback) {
    callback(
      "ALTER TABLE " +
        collection +
        " ADD " +
        this.getDbFieldName(field) +
        " JSONB"
    );
  }
});
