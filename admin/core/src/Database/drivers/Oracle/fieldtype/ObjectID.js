/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.ObjectID
 * @extend Database.fieldtype.Field
 * Mongodb ObjectId field
 */
Ext.define('Database.drivers.Oracle.fieldtype.ObjectID', {
    extend: 'Database.drivers.Mongodb.fieldtype.ObjectID'
    
    ,bldBson: function(str) {
        str = str + ''
        if(/^[a-z0-9]{24}$/.test(str)) {
            return str
        }
        return false;    
    }
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) { 
        value = /^[a-z0-9]{1,}$/.test(value)? value:'';
        if(!!callback)
            callback(value)
        else
            return value
    }
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " VARCHAR2(24), ADD INDEX (" + field.name + ")");
    }
    
})