var fs = require('fs')

/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.image
 * @extend Database.drivers.Mysql.fieldtype.image
 * Image field. Use image field in the form for this data type.
 * 
 *     @example
 *     // Detail Form 
 *     Ext.define('Desctop.mymodule.view.myModuleForm', {
 *         extend: 'Core.form.DetailForm',
 *         
 *         requires: ['Desktop.core.widgets.ImageField'],
 * 
 *         buildItems: function() {
 *             return [
 *                 .....
 *                 {
 *                     xtype: 'image',
 *                     name: 'img',
 *                     tumbSizes: '250x150x500x', // sizes of preview and full image
 *                     width: 350,
 *                     height: 150        
 *                 },
 *                 .....
 *             ]
 *         }
 *     })
 */
Ext.define('Database.drivers.Postgresql.fieldtype.image', {
    extend: 'Database.fieldtype.Field'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
        // delete image
        if(value === '-') {
            callback(null, true)
            return;
        }
        
        // don't change picture
        if(!value) {
            callback(null)
            return;
        }
                       
        var path = model.config.uploadTmpDir + '/' + value;
        fs.exists(path, function(e) {
            if(e) {
                fs.readFile(path, function(e, s) {
                    if(s) {
                        fs.unlink(path);
                        callback(s)
                        
                    } else callback(null)
                })
            } else {
                callback(null)
            }
        })
    }
    
    ,getDisplayValue: function(model, record, name, callback) {        
        if(record[name]) callback('/Admin.Data.img/' + model.collection + '.' + name + '.' + (record._id || record.id) + '.main.')
        else callback('')
    }
    
    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " bytea NULL DEFAULT NULL");
    }
})