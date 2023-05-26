/**
 * @class Core.data.ComboStore
 * @extend Core.data.Store
 * @private
 * @author Max Tushev <maximtushev@gmail.ru>
 * This is a superclass of {@link Core.data.Store}  
 */
Ext.define('Core.data.ComboStore', {
    extend: 'Core.data.Store',
    
    alias: 'store.combostore',
    
    pageSize: 1000,

    fields:[{name: '_id'},{name: 'name'}]
    
    
});