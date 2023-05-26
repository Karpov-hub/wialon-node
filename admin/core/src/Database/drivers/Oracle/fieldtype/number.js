/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.number
 * @extend Database.fieldtype.Field
 * Integer number field. Use number field in the form for this data type.
 */
Ext.define('Database.drivers.Oracle.fieldtype.number', {
    extend: 'Database.fieldtype.Field'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) { 
        
        if(value) {
            value = (value+'').replace(/\s/g,'')
            value = parseInt(value);
        }
        callback(isNaN(value)? null: (value || 0));
    }
    
    ,getFilterValue: function(model, filter, name, callback) {
        var f = {}
        var val;// = parseInt(filter.value)

        if(filter.operator) {
            if(['lt','gt','lte','gte','eq'].indexOf(filter.operator) != -1) {
                val = parseInt(filter.value);            
                if(isNaN(val)) {
                    callback(null);
                    return;
                }
                if(!f[name]){
                    f[name]={}
                }               
                f[name]['$' + filter.operator] = val;
            } else
            if(filter.operator == 'in') {
                var vals = [];
                (Ext.isArray(filter.value)? filter.value:(filter.value+'').split(',')).forEach(function(ff) {
                    ff = parseInt(ff);
                    if(!isNaN(ff)) vals.push(ff);
                })

                if(vals.length) {
                    f[name] = {$in: vals}
                } else {
                    callback(null);
                    return;
                }
            } else
                f[name] = parseInt(filter.value);
        } else
            f[name] = parseInt(filter.value);
        
        if(isNaN(f[name]))
            return callback(null);
        callback(f)   
    }
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " NUMBER NULL DEFAULT NULL");
    }
})