/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define('Database.drivers.Mongodb.fieldtype.string', {
    extend: 'Database.fieldtype.Field'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) { 
        if(!!callback) callback(value)
        else return value;
    }
    
    ,getFilterValue: function(model, filter, name, callback) {
         var f = {}
         if(filter && filter.value) { 
            f[name] = filter.value+'';//new RegExp((filter.value+'').replace(/\*/g, ''),'i');
            callback(f)   
         } else
            callback()
    }
})