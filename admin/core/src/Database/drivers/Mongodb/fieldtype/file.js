/**
 * @author Max Tushev
 * @class Database.drivers.Mongodb.fieldtype.file
 * @extend Database.fieldtype.Field
 * File field.
 *
 *     @example
 *     // Detail Form
 *     Ext.define('Desctop.mymodule.view.myModuleForm', {
 *         extend: 'Core.form.DetailForm',
 *
 *         requires: ['Desktop.core.form.UploadField'],
 *
 *         buildItems: function() {
 *             return [
 *                 .....
 *                 {
 *                       name: 'pdf',
 *                       fieldLabel: D.t('PDF'),
 *                       xtype: 'uploadfielddb',
 *                       buttonText: D.t('Выберите документ...')
 *                   },
 *                 .....
 *             ]
 *         }
 *     })
 *
 *     // DataModel
 *     ...
 *     {
 *          name: "pdf",
 *          type: "file",
 *          editable: true,
 *          visible: true
 *     },
 *     ...
 *
 */

Ext.define('Database.drivers.Mongodb.fieldtype.file', {
    extend: 'Database.fieldtype.Field'

    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
        // don't change picture
        if(!value || !value.tmpName) {
            callback(null)
            return;
        }

        var fs = require('fs')
            ,path = model.config.filesTmpDir + value.tmpName
            ,res = {
                name: value.name
            }

        fs.exists(path, function(e) {
            if(e) {
                fs.readFile(path, function(e, s) {
                    if(s) {
                        res.data = s;
                        callback(res)
                        //setTimeout(function() {fs.unlink(path)}, 100)
                    } else callback(null)
                })
            } else {
                callback(null)
            }
        })
    }

    ,getDisplayValue: function(model, record, name, callback) {
        if(record[name]) {
            callback({
                name: record[name].name,
                link: '/' + model.getName() + '.getFileFromField/?name=' + name + '&_id=' + (record._id || record.id)
            })
        }
        else callback('')
    }

})