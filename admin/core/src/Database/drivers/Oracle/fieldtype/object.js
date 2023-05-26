/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.drivers.Mysql.fieldtype.object
 * String field.
 */
Ext.define('Database.drivers.Oracle.fieldtype.object', {
    extend: 'Database.fieldtype.Field'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) { 
        try {
            value = JSON.stringify(value)
        } catch(e) {value = ''}
        callback(value)   
    }
    /*
    ,getFilterValue: function(model, filter, name, callback) {
         var f = {}
         if(filter && filter.operator) {
             switch(filter.operator) {
                case 'like': f[name] = {$like: filter.value.replace(/\* /g, '%')}    
             }
         }         
         callback(f)   
    }
    */
    
    ,getDisplayValue: function(model, record, name, cb) {        
        
        var callback = function(res) { 
            cb(res)
        }
        
        if(record[name]) {
            var body = '', lob = record[name];
            if(!!lob.setEncoding) {
           
                lob.setEncoding('utf8');
                lob.on('data', function (chunk) {
                    body += chunk;
                });
                lob.on('end', function () {                
                    try {
                        body = JSON.parse(body)
                    } catch(e) {body = null}
                    callback(body)
                });
            } else
            if(Ext.isString(lob)) {
                try {
                    body = JSON.parse(lob)
                } catch(e) {body = null}
                callback(body)
            } else
                callback(lob)  
        }
        else callback(null)
    }
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " CLOB NULL DEFAULT NULL");
    }
})