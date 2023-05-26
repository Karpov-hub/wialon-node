
Ext.define('Crm.modules.messages.view.MessagesGrid', {
    extend: 'Core.grid.GridContainer',

    title: D.t('Messages'),
    iconCls: 'x-fa fa-envelope-o',    
    
    filterable: true,
    
    requires: ['Ext.grid.plugin.RowExpander'],
    
    fields: ['_id','subject','from','ctime','body', 'new', 'to_name'],
    
    controllerCls: 'Crm.modules.messages.view.MessagesGridController',
    
    buildColumns: function() {
        var renderer = function(v,m,r) {
            if(r.data["new"])
                m.tdCls = 'message-new'
            return v;
        }
        return [{
            text: D.t("Subject"),
            flex: 1,
            sortable: true,
            dataIndex: 'subject',
            renderer: renderer
        },{
            text: D.t("From"),
            width: 100,
            sortable: true,
            dataIndex: 'from',
            renderer: renderer
        },{
            text: D.t("To"),
            width: 100,
            sortable: true,
            dataIndex: 'to_name',
            renderer: renderer
        },{
            text: D.t("Date"),
            width: 100,
            sortable: true,
            xtype: 'datecolumn',
            dataIndex: 'ctime'
        }/*,{
            text: D.t("New"),
            width: 100,
            sortable: true,
            dataIndex: 'new'
        }*/];
    }
    
    ,buildButtonsColumns: function() {
        var me = this;
        return [{
            xtype:'actioncolumn',
            width: 25,
            items: [{
                iconCls: 'x-fa fa-trash',
                tooltip: D.t('Delete the message'),
                handler: function(grid, rowIndex) {
                    me.fireEvent('delete', grid, rowIndex)
                }
            }]
        }]        
    }
    
    ,buildItems: function() {
        var me = this;
        
        return {
            xtype: 'grid',
            plugins: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl: ['{body}']
                },{
                    ptype: 'filterbar',
                    renderHidden: false,
                    showShowHideButton: true,
    	        	showClearAllButton: true
    			}
            ],
            title: this.title,
            iconCls: this.iconCls,
            store: this.store,
            tbar: this.buildTbar(),
            bbar: this.buildPaging(),
            columns: {
                items: this.columns,
                plugins: [{
                    ptype: 'gridautoresizer'
    			}]
            },
            viewConfig: {
                listeners: {
                    expandbody: function(rowNode , record , expandRow , eOpts ) {
                        me.fireEvent('expandmessage', rowNode , record , expandRow , eOpts)      
                    }
                }
            }
        }
    }
    
    ,buildTbar: function() {
        var items = this.callParent()
        items[0].text = D.t('New message')
        
        items.splice(0,0, {
            iconCls: 'x-fa fa-inbox',
            action: 'inbox',
            text: D.t('Inbox')
        },'-',{
            iconCls: 'x-fa fa-paper-plane-o ',
            action: 'outbox',
            text: D.t('Outbox')
        },'-')
        
        return items;
    }


})
