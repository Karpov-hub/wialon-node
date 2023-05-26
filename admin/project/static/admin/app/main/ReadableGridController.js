Ext.define('main.ReadableGridController', {
    extend: 'Core.grid.GridController'
   
    ,setControls: function() {
        var me = this;
        this.control({
            '[action=add]'    : {click: function(el) {me.addRecord() }},
            '[action=refresh]': {click: function(el) {me.reloadData()}},
            '[action=import]' : {click: function(el) {me.importData()}},
            '[action=export]' : {click: function(el) {me.exportData()}},
            "grid": {
                cellkeydown: function(cell, td, i, rec, tr, rowIndex, e, eOpts) {
                    return null;
                },
                celldblclick: function(cell, td, i, rec) {
                    return null;
                },
                cellclick: function(cell, td, i, rec) {
                    return null;
                },
                itemcontextmenu: function(vw, record, item, index, e, options){                
                     e.stopEvent();
                }
            }
        })
        this.view.on('activate', function(grid, indx) {
            if(!me.view.observeObject) document.title = me.view.title + ' ' + D.t('ConsoleTitle');
        })
        this.view.on('edit', function(grid, indx) {
            return null;
        })
        this.initButtonsByPermissions()
    }
})
