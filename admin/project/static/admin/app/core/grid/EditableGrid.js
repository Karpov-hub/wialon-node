Ext.define('Core.grid.EditableGrid', {
    extend: 'Core.grid.GridContainer'
    
    ,controllerCls: 'Core.grid.EditableGridController'
    
    ,filterbar: false
    
    ,gridListeners: null
    
    ,initComponent: function() {
        this.callParent(arguments)
        this.firstEditableColumn = null;
        for(var i=0;i<this.columns.length;i++) {
            if(this.columns[i].editor) {
                this.firstEditableColumn = i;
                break;
            }
        }    
    }
    
    ,buildCellEditing: function() {
        var me = this;
        this.pluginCellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2,
            listeners : {                
                beforeedit : function(editor, e) {
                    //me.editedRecord = e.record;
                    if(me.permis.modify)
                        me.fireEvent('beforeedit', editor, e);
                },
                edit : function(editor, e) {
                    if(me.permis.modify)
                        me.fireEvent('edit', editor, e);
                }
                
            }
        });
        return this.pluginCellEditing;
    }
    
    ,buildItems: function() {        
        var me = this;
        this.cellEditing = this.buildCellEditing();
        
        var plugins = [this.cellEditing]
            ,columns = {items: this.columns}
        
        if(this.filterbar) {
            plugins.push({
                ptype: 'filterbar',
            	renderHidden: false,
	        	showShowHideButton: true,
	        	showClearAllButton: true
			})
            columns.plugins = [{
            	ptype: 'gridautoresizer'
			}]
        }
        
        return {
            xtype: 'grid', 
            plugins: plugins,
            title: this.title,
            iconCls: this.iconCls,
            store: this.store,
            tbar: this.buildTbar(),
            bbar: this.buildPaging(),
            columns: columns,
            listeners: this.gridListeners
        }
    }
    
    ,buildButtonsColumns: function() {
        var me = this;
        return [{
            xtype:'actioncolumn',
            width: 27,
            menuDisabled: true,
            items: [{
                iconCls: 'x-fa fa-trash',
                tooltip: D.t('Delete the record'),
                isDisabled: function(view, rowIndex, colIndex, item, r) {
                    return !me.permis.modify;
                },
                handler: function(grid, rowIndex) {
                    me.fireEvent('delete', grid, rowIndex)
                }
            }]
        }]        
    }
    
    
})
