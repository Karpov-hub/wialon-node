Ext.define('Core.tree.Tree', {
    extend: 'Ext.tree.Panel',
    
    requires: [
        'Ext.tree.plugin.TreeViewDragDrop',
        'Ext.data.*',
        'Ext.grid.*',
        'Ext.tree.*',
        'Ext.ux.data.proxy.WebSocket',
        'Desktop.core.widgets.SearchField'
    ],    
    
    viewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop',
                containerScroll: true,
                enableDrag: true,
                enableDrop: true
                ,appendOnly: false
                ,displayField: 'name'
                
            }
    },
    
    //useArrows: true,
    multiSelect: false,
    //singleExpand: true,
    rootVisible: false,
            
    initComponent: function() {    
        var me = this;
        
        if(!this.model) {
            var s = Object.getPrototypeOf(this).$className
            this.model = Ext.create(s.replace('.view.','.model.').substr(0, s.length - 3) + 'Model')
        } else
        if(Ext.isString(this.model))
            this.model = Ext.create(this.model)
            
        if(this.controllerCls) {
            this.controller = Ext.create(this.controllerCls);
        } else
        if(!this.controller)
            this.controller = Ext.create('Core.tree.TreeController');    
      
        this.store = this.buildStore()         
        
        this.tbar = this.buildButtons()
        this.columns = {items: this.buildColumns()}
        this.callParent();
    }
    
    ,buildStore: function() {
        return Ext.create('Core.data.StoreTree', {
            //model: modelPath + '_inn',
            dataModel: Object.getPrototypeOf(this.model).$className,
            fieldSet: this.fieldSet,
            storeId: 'store-' + (new Date()).getTime()+Math.random(),
            scope: this.scope,
            sorters: [{
                property: 'indx',
                direction: 'ASC'
            }],
        	root: this.rootNode()
        })    
    }
    
    ,rootNode: function() {
        return {
        	name: 'Root' ,
            expanded: true
    	}
    }
    
    ,buildColumns: function() {
        return [{
                xtype: 'treecolumn',
                text: D.t('Name'),
                flex: 1,
                //sortable: true,
                dataIndex: 'name'
            },this.buildButtonsColumns()]
    }
    
    ,buildButtonsColumns: function() {
        var me = this;
        return {
            xtype:'actioncolumn',
            width: 80,
            items: [{
                iconCls: 'x-fa fa-pencil-square-o',
                tooltip: D.t('Edit the record'),
                handler: function(grid, rowIndex) {
                    me.fireEvent('edit', grid, rowIndex)
                }
            },{
                iconCls: 'x-fa fa-plus',
                tooltip: D.t('Add the record'),
                handler: function(grid, rowIndex, a,b,c,d) {
                    me.fireEvent('add', grid, d)
                }
            },{
                iconCls: 'x-fa fa-trash',
                tooltip: D.t('Delete the record'),
                handler: function(grid, rowIndex, a,b,c,d) {
                    me.fireEvent('delete', grid,  d)
                }
            }]
        }        
    }
    
    ,buildButtons: function() {
        var items = [{
            text: D.t('Add'),
            iconCls:'x-fa fa-plus',
            scale: 'medium',
            action: 'add'
        },'-',{
            tooltip:D.t('Reload data'),
            iconCls:'x-fa fa-refresh',
            action: 'refresh'
        }]
        
        if(this.filterable)
            items.push('->',this.buildSearchField())
            
        return items;
    }
    
    ,buildSearchField: function() {
        return {
            width: 300,
            emptyText: D.t('Search'),
            margin: '0 10 0 20',
            xtype: 'xsearchfield',
            store: this.store
        }
    }
});