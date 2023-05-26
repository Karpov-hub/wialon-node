/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define("Database.drivers.Postgresql.fieldtype.array", {
  extend: "Database.drivers.Mongodb.fieldtype.array",

  getFilterValue: function(model, filter, name, callback) {
    var f = {};
    if (Ext.isString(filter.value)) {
      if (/^[0-9]{1,}$/.test(filter.value)) {
        f.$or = [{}, {}];
        f.$or[0][name + "___"] = '{"_arr":["' + filter.value + '"]}';
        f.$or[1][name + "___"] = '{"_arr":[' + filter.value + "]}";
      } else f[name + "___"] = '{"_arr":["' + filter.value + '"]}';
    } else f[name + "___"] = '{"_arr":[' + filter.value + "]}";

    //console.log(f)

    if (!!callback) callback(f);
    else return f;
  },

  getDisplayValue: function(model, record, name, callback) {
    callback(record[name] || null); //callback (record[name] && record[name].arr? record[name].arr: null);
  },

  getValueToSave: function(model, value, newRecord, oldRecord, name, cb) {
    cb(Ext.isArray(value) ? value : [value]);
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
