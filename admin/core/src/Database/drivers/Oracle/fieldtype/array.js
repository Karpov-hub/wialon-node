/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define('Database.drivers.Oracle.fieldtype.array', {
    extend: 'Database.drivers.Mongodb.fieldtype.array'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, cb) {      
        var items;
        
        var callback = function(out) {
            if(out) out = JSON.stringify(out)
            cb(out)
        }
        
        
        if(value) {
            if(!Ext.isArray(value)) value = [value]
        }
        
        for(var i=0;i<model.fields.length;i++) {
            if(model.fields[i].name == name) {
                if(model.fields[i].itemsType) {
                    this.prepItemsType(model, model.fields[i].itemsType, value, newRecord, name,  callback)
                    return;
                } else
                if(model.fields[i].items) items = model.fields[i].items
                break;
            }
        }
        
        if(items) {
            this.prepItems(model, items, value, name,  callback)    
        } else {       
            callback(value);
        }
    }
    
    ,getFilterValue: function(model, filter, name, callback) {
         var f = {}
         if(filter && filter.operator) {
             switch(filter.operator) {
                case 'like': f[name] = {$like: filter.value.replace(/\*/g, '%')}    
             }
         }         
         callback(f)   
    }
    
    ,getDisplayValue: function(model, record, name, callback) {        
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