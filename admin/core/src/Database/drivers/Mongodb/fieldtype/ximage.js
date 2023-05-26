var fs = require('fs');


/**
 * @author Datta
 * @class Database.drivers.Mongodb.fieldtype.ximage
 * @extend Database.drivers.Mongodb.fieldtype.image
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
 *                     xtype: 'ximage',
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
Ext.define('Database.drivers.Mongodb.fieldtype.ximage', {
    extend: 'Database.drivers.Mongodb.fieldtype.image'

    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
        var getConfig=function () {
            for(var i=0;i<=model.fields.length;i++){
                if(model.fields[i].name==name){
                    return model.fields[i];
                }
            }
        };
        var config=getConfig();
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


        var path = model.config.filesTmpDir + value //model.config.adminCoreModulesDir + '/../../tmp/'+value
            ,res = {}
        fs.exists(path, function(e) {
            if(e) {
                [
                    function (next) {
                        if(config.width &&  config.height){
                            var easyimg=require('easyimage');
                            easyimg.resize({src:path,dst:path,width:config.width, height:config.height},function (err,image) {
                                next(path);
                            })
                        }else{
                            next(path);
                        }
                    },
                    function (path,next) {
                        fs.readFile(path, function(e, s) {
                            if(s) {
                                fs.unlink(path)
                                next(s);
                            } else {
                                callback(null)
                            }
                        });
                    },
                    function (img) {
                        res.img = img;
                        callback(res);
                    }
                ].runEach();
            } else {
                callback(null)
            }
        })
    }
})
