/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.date
 * @extend Database.fieldtype.Field
 * Date field. Use date field in the form for this data type.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.timestump', {
    extend: 'Database.drivers.Oracle.fieldtype.timestump'
    

    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " BIGINT");
    }
})