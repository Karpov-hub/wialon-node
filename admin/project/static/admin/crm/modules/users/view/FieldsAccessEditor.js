Ext.define('Crm.modules.users.view.FieldsAccessEditor', {
    extend: 'Ext.window.Window'

    ,autoShow: true
    
    ,width: 400
    ,height: 400
    ,modal: true
    ,title: D.t('Access for fields')
    ,layout: 'fit'
    
    ,requires: [
        'Ext.grid.column.Check'    
    ]
    
    ,constructor: function(cfg) {
        this.data = cfg.data
        this.callback = cfg.callback
        this.callParent(arguments)
    }
    
    ,initComponent: function() {
        this.title = this.data.hname
        this.buttons = this.buildButtons()
        this.store = this.buildStore() 
        this.items = this.buildGrid()
        this.readData()
        this.callParent(arguments)  
    }
    
    ,makeResult: function() {
        var out = {}
        
        this.store.each(function(r) {
            out[r.data.name] = {
                editable: r.data.editable,
                visible: r.data.visible     
            }
        })
        this.callback(out)
    }
    
    ,onCheckColumnsClick:function( ct, column, e, t, eOpts ) {
        var selAll = true
            ,store = ct.ownerCt.getStore()
            ,data = [];
        if(!store.each) return;
        store.each(function(r) {
            if(r.data[column.dataIndex]) {
                selAll = false;
                r.data[column.dataIndex] = false;                
            }
            data.push(r.data);
        })
        if(selAll) {
            data = []
            store.each(function(r) {
                r.data[column.dataIndex] = true;
                data.push(r.data);
            })
        }
        store.loadData(data)
    }
    
    ,readData: function() {
        
        var me = this;
        Ext.create(this.data.name.replace(/-/g,'.'))
        .getFields(function(fields) {
            var _th = this, data = []
            
            fields.forEach(function(f) {
                if(f.visible) 
                    data.push({
                        name: f.name,
                        editable: me.data.ext && me.data.ext[f.name]? me.data.ext[f.name].editable:false,
                        visible: me.data.ext && me.data.ext[f.name]? me.data.ext[f.name].visible:false
                    })
            }) 
            
            me.store.loadData(data)
        })
        
        
    }
    
    ,buildButtons: function() {
        var me = this;
        return [
            {
                text: D.t('Apply'), 
                iconCls:'x-fa fa-check', 
                scale: 'medium',
                handler: function() {
                    me.makeResult()
                    me.close()
                }},
            '-',
            {
                text: D.t('Cancel'), 
                iconCls:'x-fa fa-ban', 
                handler: function() {
                    me.close()    
                }}
        ]
            
    }
    
    ,buildStore: function() {
        return  Ext.create("Ext.data.Store", {
            fields: ['name', 'collection', 'editable', 'visible']                
        })   
    }
    
    ,buildGrid: function() {
        return {
            xtype: 'grid',
            store: this.store,            
            columns: [
                {   
                    text: D.t("Field name"),
                    flex: 1,
                    menuDisabled: true,
                    sortable: true,
                    dataIndex: 'name'
                    //renderer: function(v,m,r) {return D.t(r.data.collection + '.' + v)}
                },{   
                    text: D.t("Read"),
                    xtype : 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'visible',
                    listeners: {
                        headerclick: this.onCheckColumnsClick
                    }
                },{   
                    text: D.t("Modify"),
                    xtype : 'checkcolumn',
                    sortable: false,
                    menuDisabled: true,
                    width: 80,
                    dataIndex: 'editable',
                    listeners: {
                        headerclick: this.onCheckColumnsClick
                    }
                }
            ]
        }
    }
    
})