/**
 * Ex:
 * Ext.create('Core.form.DependedTags', {
 *     flex: 1,
 *     name: 'model',
 * 	   fieldSet: '_id,modelname',
 * 	   displayField: 'modelname',
 *     parentEl: this.BrandCombo, // элемент, от которого зависит данное комбо
 *     parentField:'brandId',// ключ, по которому происходит связывание данных - foreignKey
 * 	   dataModel: 'Crm.modules.models.model.ModelsModel'
 *  })
 */

Ext.define('Core.form.DependedTags', {
    extend: 'Ext.form.field.Tag',
    
    alias: 'widget.dependedtags',
    
    valueField: '_id',
    displayField: 'name',
    queryMode: 'local',
    fieldSet: '_id,name',



    constructor: function(cfg) {
        if(!!cfg.constr) {
            cfg.constr(this)
        }
        
        this.callParent(arguments)
    }
    
    ,initComponent: function() {
        var me = this;
        me.readyForSetValue = false;
        me.readyForGetValue = false;
        
        this.listeners = {
              afterrender:function(combo){
                  var me = this,
                  values = me.getValueRecords();
                  me.inputEl.set({'placeholder': values.length ? '' :me.labelText});
              },
              change:function(tag, v){
                  me.savedValue = v;
                  var _this = this,
                  values = _this.getValueRecords();
                  if(!!_this.inputEl) _this.inputEl.set({'placeholder': values.length ? '' :_this.labelText});
              },
              select: function() {
                 //me.savedValue = me.getValue();                
                 me.inputEl.dom.value = '';
              }
        }
        
        var storeCfg = {
            
            dataModel: this.dataModel,
            fieldSet: this.fieldSet,
            autoLoad: !me.parentEl,
            scope: this
        }
        
        if(this.sorters) storeCfg.sorters = this.sorters;

        this.store = Ext.create('Core.data.DependComboStore', storeCfg)
        
        this.store.on({
            ready: function(th, options) {
                if(me.parentEl) {
                    me.bindToParent(me.store, options)                    
                } else {
                    me.loadDataModel(me.store, options)                   
                } 
            },
            datachanged: function(a,b,c) {               
                me.readyForSetValue = true;    
                me.setValue(me.savedValue);
                setTimeout(function() {me.store.isDataReady = true;}, 100)
            },
            //dataready: function() {
            //    me.setValue(me.savedValue);
            //}
        })
        this.callParent(arguments)
    }
    
    ,setValue: function(value, strong) {  

        if(strong) {
            this.callParent(arguments)
            this.readyForGetValue = true;
            return;
        }
        
        if((value === '' || (value && value.length)) && this.readyForSetValue) {            
            if(value.length && !this.store.getData().items.length) {
                var me = this;
                setTimeout(function() {
                    me.setValue(value)
                }, 500)
            } else {
                this.callParent(arguments)
                this.readyForGetValue = true;
            }
        } else
        if(value && value.length) {
            this.savedValue = value;
        }
        
        
    }
    
    ,getSubmitValue: function() {  
   
        var v;        
        if(!this.readyForGetValue && this.savedValue !== undefined) {          
            v = this.savedValue && this.savedValue.length? this.savedValue : '';
        } else {
             v = this.callParent(arguments)
        }         
        return v;
    }

    
    ,loadDataModel: function(store, options, pid, strong) {
        var me  =this, find = {}, currentValue = this.getValue();
        if(pid && me.parentField) {
            find = {filters: [{property: me.parentField, operator: 'in', value: Ext.isArray(pid)? pid.join(','):pid}]};
                    
        }
        if(Ext.isString(store.dataModel)) {
            store.dataModel = Ext.create(store.dataModel)
        }

        store.dataModel.readAll(function(data) {
            
            var list = [], newCurrentValue = [];

            data.list.forEach(function(r) {
                var v = r[me.displayField]
                if(!v) return;                
                var x = v.split(' ');
                //if(x.length>1 && x[0].length<3) x.splice(0,1) 
                
                var o = {name: x.join(' ')}
                
                o[store.dataModel.idField] = r[store.dataModel.idField]
                
                for(var i in r) {
                    if(!o[i]) o[i] = r[i]    
                }
                o[me.valueField] = r[me.valueField]
                
                if(currentValue.indexOf(r[me.valueField]) != -1) {
                    newCurrentValue.push(r[me.valueField])
                }
                
                list.push(o)    
            })   
            if(me.autoSort !== false)
                list.sort(function(a,b) {
                    return a.name>b.name? 1:-1
                })
            store.loadData(list)
    		
            me.setValue(newCurrentValue, strong);	
            
        }, find)
        if(options.scope) store.scope = options.scope        
        store.dataActionsSubscribe()
    }
    
    ,bindToParent: function(store, options) {
        var me = this;
        setTimeout(function() {
            var el = (Ext.isString(me.parentEl)? me.up('form').down('[name=' + me.parentEl + ']'):me.parentEl)            
            
            el.on('change', function(e,x,y,z) {
                me.parentOnChange(e,x, store, options)
            })
            
            me.checkParentValue(el, store, options)
            
        }, 500)
        
    }
    
    ,checkParentValue: function(parentElement, store, options) {
        var me = this
            ,val = parentElement.getValue()

            
            
        if(val) {
            me.defaultValue = me.getValue()
            me.parentOnChange(parentElement,val, store, options, true)
        } 
    }
    
    ,parentOnChange: function(e, x, store, options) {
        if(x && x.length) {
            this.loadDataModel(store, options, x, true)
        } else {
            this.store.loadData([]);
            this.setValue('', true);
        }
        //this.setValue('')
        //this.fireEvent('change', this, '','')
    }

})

