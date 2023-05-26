/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define('Database.drivers.Mysql.fieldtype.string', {
    extend: 'Database.drivers.Mysql.fieldtype.Field'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback, field) { 
        var len = field && field.len? field.len : 4000; 
        if(value === undefined) value = null
        if(Ext.isArray(value)) {
            value.each((v) => {
                if(v.$)
                   return v.$
                else
                    return v;
            }, true)
            value = value.join('\n')
        }
        if(value && value.length > len) {
            
            value = value.substr(0,len)
        }
        
             callback(value)   
    }
    
    ,getFilterValue: function(model, filter, name, callback) {
         var f = {}
         if(filter && filter.operator) {
             switch(filter.operator) {
                case 'like': f[name] = {$like: filter.value + '%'}    
             }
         } else
            f[name] = filter.value;
         callback(f)   
    }
})