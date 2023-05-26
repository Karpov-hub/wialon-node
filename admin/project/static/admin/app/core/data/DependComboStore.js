/**
 * @class Core.data.ComboStore
 * @extend Core.data.Store
 * @private
 * @author Max Tushev <maximtushev@gmail.ru>
 * This is a superclass of {@link Core.data.Store}  
 */
Ext.define('Core.data.DependComboStore', {
    extend: 'Core.data.Store',
    
    alias: 'store.dependcombostore',
    
    pageSize: 1000,
    
    autoLoad: true,

    fields:[{name: '_id'},{name: 'name'}],
    data: [],
    isDataReady: false,
    
    storeType: 'combostore'
    
    
    
    ,initDataGetter: function(options) {
        var me = this;
        if(me.autoLoad) {
            me.dataModel.readAll(function(data) {
                if(!!me.prepData) {
                    data.list = me.prepData(data.list)   
                }
                me.loadData(data.list)
                setTimeout(function() {
                    me.isDataReady = true;
                    me.fireEvent('dataready', me, options)
                    
                },100)
            })
        }
        if(options.scope) this.scope = options.scope        
        me.dataActionsSubscribe()
        setTimeout(function() {
            me.fireEvent('ready', me, options)
        }, 100)
    }
    

    
    
});