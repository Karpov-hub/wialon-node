/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.richtext
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.richtext', {
    extend: 'Database.drivers.Oracle.fieldtype.richtext'
    
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " TEXT");
    }
})