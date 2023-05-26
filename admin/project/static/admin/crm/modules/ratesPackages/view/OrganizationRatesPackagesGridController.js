Ext.define('Crm.modules.ratesPackages.view.OrganizationRatesPackagesGridController', {
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
            var request=grid.getStore().getAt(indx).data;
            me.showRatesPackages(request);
        })
        this.initButtonsByPermissions()
    }

    ,showRatesPackages:function(request){
        var me = this;
        __CONFIG__.ratePackageId=request.id;
        __CONFIG__.rates_orgnization_id=me.view.observeObject.organization_id;
        __CONFIG__.showRatesPackagesWindow = Ext.create('Ext.window.Window', {
  
            width: '70%',
      
            title: 'Packages: Select any package and save to change current organization\'s package',   
  
            modal:true,        
      
            autoScroll:true,
  
            items: [{ 
                  xtype: 'panel',
                  autoScroll:true,            
                  items: 
                      Ext.create('Crm.modules.ratesPackages.view.RatesPackageSelectableGrid', {
                      title: null,
                      iconCls: null,
                      scope: me,
                })
            }],
  
            listeners:{
                close:function(e,v){
                    me.view.store.reload();
                }
            }
            
        }).show();
    }
})
