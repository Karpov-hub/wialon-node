/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.date
 * @extend Database.fieldtype.Field
 * Date field. Use date field in the form for this data type.
 */
Ext.define('Database.drivers.Mongodb.fieldtype.timestump', {
    extend: 'Database.fieldtype.date'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) { 
        var d = ((value? new Date(value) : new Date()).getTime())
        if(!!callback) callback(d)
        else return d;
    }    

    ,getDisplayValue: function(model, record, name, callback) {        
        callback(new Date(record[name]))
    }
})