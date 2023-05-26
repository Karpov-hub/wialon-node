/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.date
 * @extend Database.fieldtype.Field
 * Date field. Use date field in the form for this data type.
 */
Ext.define('Database.drivers.Mongodb.fieldtype.date', {
    extend: 'Database.fieldtype.date'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {      
        if(!!callback) callback(value? new Date(value):null)
        else return value? new Date(value):null;
    }
})