Ext.define('Core.sign.SignButton', {
    extend: 'Ext.button.Split',

    text: D.t('Sign'),
    iconCls:'x-fa fa-pencil', 
    scale: 'medium',
    
    constructor: function(cfg) {
        this.parentView = cfg.parentView;                
        this.callParent(arguments)
    },
    
    initComponent: function() {
        var me = this;
        this.on('click', function() {     
            if(me.signobject.signs && me.signobject.signs.indexOf(localStorage.getItem('uid')) != -1) {
                D.a('Sign', 'You have already signed this document', [], function() {})
            } else
                me.sign()
        })
        
        this.menu = []
        
        if(this.signobject && this.signobject.shouldSign) {           
            this.menu.push({
                iconCls: 'x-fa fa-ban',
                text: D.t('Withdraw signature'),
                handler: function() {me.unsign()}
            })
        }    
        this.menu.push({
            iconCls: 'x-fa fa-history',
            text: D.t('History'),
            menu: {
                items: this.buildHistoryGrid() 
            }
        })
        
        this.idField = this.parentView.controller && this.parentView.controller.model && this.parentView.controller.model.idField? this.parentView.controller.model.idField:'_id';
        
        this.callParent(arguments)
    }
    
    ,buildHistoryGrid: function() {
        var store = Ext.create("Ext.data.Store", {
            fields: ['user', 'date', 'note'],
            data: this.signobject && this.signobject.history? this.signobject.history:[]
        })
        return {
            xtype: 'grid',
            width: 300,
            height: 300,
            store: store,
            hideHeaders: true,
            columns: [{
                flex: 1,
                sortable: false,
                dataIndex: 'user',
                renderer: function(v,m,r) {
                    return '<b>' + r.data.user + ' | ' +Ext.Date.format(new Date(r.data.date), 'd.m.Y H:i')+ '</b><br>' + D.t(r.data.note);
                }
            }]
        }
    }
    
    ,sign: function() {
        var me = this, 
            id = this.parentView.down('[name='+me.idField+']').getValue()
            
        if(id) {
            this.parentView.controller.model.signRecord(id, function(res) {
                if(res.success) {
                    D.a('Sign result', 'Document signed')
                    if(!!me.parentView.close) me.parentView.close()
                } else {
                    D.a('Sign error', res.mess)
                }                    
            })  
        }
    }
    
    ,unsign: function() {
        var me = this, 
            id = this.parentView.down('[name='+me.idField+']').getValue()
            
        if(id) {
            D.p('Unsigning', 'Please enter your reason:', [], function(note) {
                me.parentView.controller.model.unSignRecord(id, note, function(res) {
                    if(res.success) {
                        D.a('Result', 'Document unsigned');
                        me.signobject.signs = [];
                        if(!!me.parentView.close) me.parentView.close()
                    } else {
                        D.a('Sign error', res.mess)
                    }                    
                })
            })
        }
    }
    
    
})