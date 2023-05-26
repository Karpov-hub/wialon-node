Ext.define('Crm.modules.reports.view.ReportsGridController', {
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
                    if(e.keyCode == 13) {
                      return null;
                    }
                },
                celldblclick: function(cell, td, i, rec) {
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
        this.view.on('download_report', async function(grid, indx) {
            var rec=grid.getStore().getAt(indx).data;
            let secret_key = await this.model.getSecretKey({uid: localStorage.uid});
            if(rec && rec.provider_id){
                window.open(__CONFIG__.downloadFileLink+"/"+rec.provider_id+"/"+secret_key+"/admin_download",'_blank');
            }else{
                D.a('Failed', 'Provider is not asssigned to this report.')
            }
        })
        this.initButtonsByPermissions()
    }


})
