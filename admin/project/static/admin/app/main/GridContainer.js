/**
 * @author Vaibhav Mali
   @Date: 25 Sept 2018
 */
Ext.define('main.GridContainer', {
    extend: 'Core.grid.GridContainer',


    controllerCls:'main.GridController',


    buildGridPanel: function() {    
        var plugins = []
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
        
        var cfg = {
            xtype: 'grid',
            plugins: plugins,
            store: this.store,
            
            columns: columns
        };
        if(this.gridCfg) {
            for(var i in this.gridCfg) cfg[i] = this.gridCfg[i];
        }
        return cfg;
    }

    ,buildItems: function() {
        var plugins = []
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
        var cfg = {
            xtype: 'grid',
            plugins: plugins,
            title: this.title,
            iconCls: this.iconCls,
            store: this.store,
            tbar: this.buildTbar(),
            bbar: this.buildPaging(),
            columns: columns
        };
        if(this.gridCfg) {
            for(var i in this.gridCfg) cfg[i] = this.gridCfg[i];
        }
        return cfg;
    }

    ,buildPaging: function() {
        var pg = Ext.create('Ext.PagingToolbar', {
             store: this.store,
             displayInfo: true,
             displayMsg: D.t('Displaying topics {0} - {1} of {2}'),
             emptyMsg: D.t("No topics to display"),
             inputItemWidth : 60,  
             items: this.buildBbar()
         })   
        
        if(this.store)  {
            this.store.on('load', function(st, data) {
                __CONFIG__.refreshNeeded=true;
                 if(!data.length && pg) {
                     var ap = pg.getPageData();
                     if(ap.currentPage > 1) {
                         pg.movePrevious()
                     }
                     
                 }
            })
        }        
         return   pg;  
    }
        
})