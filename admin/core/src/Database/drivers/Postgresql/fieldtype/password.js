var crypto = require('crypto')

/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.password
 * @extend Database.fieldtype.Field
 * Password field. Use text field with param "inputType: 'password'" in the form for this data type.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.password', {
    extend: 'Database.drivers.Oracle.fieldtype.password'
    

    ,createField: function(field, collection, db, callback) {
        var len = 255
        if(field.len) len = field.len
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " VARCHAR(" + len + ")");
    }
    
})