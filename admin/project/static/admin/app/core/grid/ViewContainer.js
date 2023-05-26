
Ext.define('Core.grid.ViewContainer', {
    extend: 'Core.grid.GridContainer',
    
    requires: [
        'Ext.view.View'
    ]

    ,buildColumns: function() {
        return [];
    }
    
    ,itemSelector: 'div.catalogue-item'
    

    ,buildItems: function() {
        var me = this;
        return {
            xtype: 'panel',
            //layout: 'fit',
            title: this.title,
            tbar: this.buildTbar(),
            bbar: this.buildPaging(),
            scrolable: true,
            items: {
                xtype: 'dataview',            
                
                iconCls: this.iconCls,
                store: this.store,                
                tpl: this.itemTpl,
                itemSelector: this.itemSelector,
                emptyText: D.t('No items available'),
                disableSelection: true,
                listeners: {
                    itemclick: function(el, record, item, index, e, eOpts) {
                        switch(e.browserEvent.target.getAttribute('action')) {
                            case 'remove': {me.fireEvent('delete', el, index);} break;
                            case 'edit': {me.fireEvent('edit', el, index);} break;
                        }
                    }
                }
            }
        };

    }

    ,buildColumns: function() {
        return []        
    }

})