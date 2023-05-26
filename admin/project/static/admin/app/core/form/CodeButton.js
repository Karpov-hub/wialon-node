Ext.define('Desktop.core.form.CodeButton',{
    extend: 'Ext.button.Button'
    ,alias: 'widget.codebutton'
    
    ,envCode: '{code}'
    ,winTitle: null
    
    ,mixins: {
        field: 'Ext.form.field.Field'
    }
    
    ,requires: [
        'Ext.form.field.TextArea'
    ]
    
    ,onClick: function(e) {
        this.showCodeWindow()
    }    
    
    ,setValue: function(value) {
        this.value = value
        this.fireEvent('change', this, value);
    }
    
    ,getValue: function() {
        return this.value;
    }
    
    ,getSubmitData: function() {
        var res = {}
        res[this.name] = this.getValue()
        return res
    }
    
    ,showCodeWindow: function() {
        var me = this;
        var win = Ext.create('Ext.window.Window', {
            title: me.winTitle,
            autoShow: true,
            maximizable: true,
            modal: true,
            layout: 'fit',
            width: 350,
            height: 350,
            items: {
                xtype: 'textarea',
                value: me.value || me.defaultCode
            },
            buttons: [{
                text: D.t('Accept'),
                handler: function() {
                    me.codeAccept(win)
                }
            },{
                text: D.t('Close'),
                handler: function() {
                    win.close()
                }
            }]
        });
    }
    ,codeAccept: function(win) {
        var v = win.down('textarea').getValue();
        var ev;
        if(v) {
            if(this.envCode) {
                ev = this.envCode.replace('{code}', v);
            } else  
                ev = v;
            try {
                eval(ev)
            } catch(e) {
                alert(e)
                return;
            }
        }
        this.setValue(v);
        win.close()
    }
    
    
})