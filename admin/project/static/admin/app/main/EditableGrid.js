/**
 * @author Vaibhav Mali
   @Date: 26 Nov 2018
 */
Ext.define('main.EditableGrid', {
    extend: 'Core.grid.EditableGrid',


    buildItems: function() {        
        var me = this;
        this.cellEditing = this.buildCellEditing();
        
        var plugins = [this.cellEditing]
            ,columns = {items: this.columns}
        
        if(this.filterbar) {
            plugins.push({
                ptype: 'filterbar',
            	renderHidden: false,
	        	showShowHideButton: false,
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
        
})