Ext.define('Crm.modules.users.controller.GroupsController', {
    extend: 'Core.form.FormController'
    
    ,setControls: function() {
        
        var me = this;
        
        me.control({
            '[xtype=checkcolumn]':{
                headerclick: me.onCheckColumnsClick
            }
        })
        
        this.view.on('beforesave', function(view, data) {
            data.modelaccess = {};
            view.down('[action=model-access]').getStore().each(function(item) {
                 data.modelaccess[item.data.name] = {
                     read: item.data.read,
                     add: item.data.add,
                     modify: item.data.modify,
                     del: item.data.del,
                     ext: item.data.ext
                 }
            })
            data.apiaccess = {};
            view.down('[action=api-access]').getStore().each(function(item) {
                 data.apiaccess[item.data.name] = {
                     read: item.data.read,
                     add: item.data.add,
                     modify: item.data.modify,
                     del: item.data.del,
                     ext: item.data.ext
                 }
            })
        })
        
        this.view.on('editextra', function(grid, rec) {
            me.editFieldsAccess(rec.data, function(ext) {
                rec.data.ext = ext;
                rec.commit()
            })    
        })
        
        this.callParent(arguments)
    }
    
    ,onCheckColumnsClick:function( ct, column, e, t, eOpts ) {
                
        var selAll = true
            ,store = ct.ownerCt.getStore()
            ,data = [];
        
        if(!store.each) return;
        
        store.each(function(r) {
            if(r.data[column.dataIndex]) {
                selAll = false;
                r.data[column.dataIndex] = false;                
                //r.commit()
            }
            data.push(r.data);
        })
        
        if(selAll) {
            data = []
            store.each(function(r) {
                r.data[column.dataIndex] = true;
                data.push(r.data);
                //r.commit()
            })
        }
        
        store.loadData(data)
        //store.commitChanges()
    }
        
    ,afterDataLoad: function(data, cb) {
        var me = this;
        
        me.fillModulesStore(data, 'model-access', 'modelaccess',  function() {
            me.fillModulesStore(data, 'api-access', 'apiaccess',  function() {
                cb(data)    
            })
        })

    }
    
    ,fillModulesStore: function(data, gridName, fieldName, cb) {
        var me = this;
        me.getModels(fieldName, function(models) {
            if(data[fieldName]) {
                for(var i=0;i<models.length;i++) {
                
                    if(data[fieldName][models[i].name]) {
                        models[i].read = data[fieldName][models[i].name].read
                        models[i].add = data[fieldName][models[i].name].add
                        models[i].modify = data[fieldName][models[i].name].modify
                        models[i].del = data[fieldName][models[i].name].del
                        models[i].ext = data[fieldName][models[i].name].ext
                    } else {
                        models[i].read = false
                        models[i].add = false
                        models[i].modify = false
                        models[i].del = false
                    }
                    models[i].hname = D.t(models[i].name)
                }
            }
            var store = me.view.down('[action='+gridName+']').getStore();
            store.loadData(models)
            cb()
        })
    }
    
    
    ,getModels: function(fieldName, callback) {
        var me = this;
        
        if(fieldName == 'modelaccess') {
            me.model.getModules(function(modules) {
                var arr = [], name
                for(var i=0;i<modules.length;i++) {
                    name = D.t(modules[i].name)
                    if(name != '-') arr.push({name: modules[i].name, hname: name})
                }
                callback(arr)    
            })
        }
        if(fieldName == 'apiaccess') {
            me.model.getApiUrls(function(modules) {
                var arr = [], name
                for(var i=0;i<modules.length;i++) {
                    name = D.t(modules[i].name)
                    if(name != '-') arr.push({name: modules[i].name, hname: name})
                }
                callback(arr)    
            })
        }
    }
    
    ,editFieldsAccess: function(data, cb) {
        Ext.create('Crm.modules.users.view.FieldsAccessEditor', {
            data: data,
            callback: cb
        })    
    }

})