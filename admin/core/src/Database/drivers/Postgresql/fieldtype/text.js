/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.text', {
    extend: 'Database.drivers.Mysql.fieldtype.string'
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " TEXT");
    }
})