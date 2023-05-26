/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.number
 * @extend Database.fieldtype.Field
 * Integer number field. Use number field in the form for this data type.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.number', {
    extend: 'Database.drivers.Oracle.fieldtype.number'
    
   
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " INT NULL DEFAULT NULL");
    }
})