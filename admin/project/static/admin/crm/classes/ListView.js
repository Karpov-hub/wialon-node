Ext.define('Crm.classes.ListView', {
    extend: 'Ext.panel.Panel'
    
    ,pageSize: 100 
    ,legendHeight: 100
    ,layout: 'border'
    
    

    ,initComponent: function() {
        var me = this;        
        
        this.controller = Ext.create('Crm.classes.ListController')
        
        this.tbar = this.buildTbar();        
        this.items = [
            this.buildLegend(),
            this.buildGrid()
        ];        
        this.callParent(arguments);
        
        this.scope.on({
            filterschange: function(filters) {
                me.store.getFilters().clear();
                if(filters) {
                   
                    me.store.getFilters().add(filters);
               
                } else me.store.load()
            },
            changefilters: function(vw, filters, filt) {
                me.legendPanel.update(filt)
            }
        })
    }
    
    ,buildLegend: function() {
        this.legendPanel = Ext.create('Ext.panel.Panel', {
            region: 'north',
            height: this.legendHeight,
            split: true
        })
        return this.legendPanel;
    }
    
    ,buildGrid: function() {
        return Ext.create('Ext.grid.Panel', {
            region: 'center',
            store: this.buildStore(),
            columns: this.buildColumns(),
            bbar: this.buildPaging(),
            hideHeaders: true
        })
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
            //pageSize: 100,
            scope: this
        })
        this.store.setRemoteFilter(true);
        //this.store.setRemoteSort(true);
        return this.store;
    }
    
    ,buildTbar: function() {
        return [{
            text: D.t('Settings'),
            iconCls: 'x-fa fa-cog',
            menu: [{
                text: D.t('Export to PDF'),
                action: 'topdf',
                iconCls: 'x-fa fa-file-pdf-o'
            },'-',{
                text: D.t('Print Preview'),
                action: 'print',
                iconCls: 'x-fa fa-print'
            }]
        }]
    }
    
    ,buildPaging: function() {
        //var me = this;        
        return  Ext.create('Ext.PagingToolbar', {
            store: this.store,
            displayInfo: true,
            displayMsg: D.t('Displaying topics {0} - {1} of {2}'),
            emptyMsg: D.t("No topics to display")
        })   
    }
    
    ,buildColumns: function() {
        var me = this;
        return [{
            //text: D.t('Patient'),   
            dataIndex: 'id', 
            flex: 1,
            renderer: function(v,m,r) {
                return new Ext.XTemplate(me.itemTpl).apply(r.data)
            }
        }]
    }
    
})