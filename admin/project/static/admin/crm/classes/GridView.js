Ext.define('Crm.classes.GridView', {
    extend: 'Crm.classes.ListView'
    
    
    ,buildGrid: function() {
        return Ext.create('Ext.grid.Panel', {
            region: 'center',
            store: this.buildStore(),
            columns: this.buildColumns(),
            //bbar: this.buildPaging()
        })
    }
    
    ,buildTbar: function() {
        return [{
            text: D.t('Settings'),
            iconCls: 'x-fa fa-cog',
            menu: [{
                text: D.t('Export to XLS'),
                action: 'toxls',
                iconCls: 'x-fa fa-file-excel-o'
            },'-',{
                text: D.t('Print Preview'),
                action: 'print',
                iconCls: 'x-fa fa-print'
            }]
        }]
    }

    
    ,buildStore: function() {
        this.store = Ext.create('Core.data.Store', {
            dataModel: this.dataModel,
            fieldSet: this.fieldSet,           
            filterParam: 'q',
            remoteFilter: true,
            remoteSort: false,
            scope: this,
            scrollable: true,
            scope: this
        })
        this.store.setRemoteFilter(true);
        //this.store.setRemoteSort(true);
        return this.store;
    }


})