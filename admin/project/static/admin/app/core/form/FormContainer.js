Ext.define('Core.form.FormContainer', {
    extend: 'Admin.view.main.AbstractContainer'
    
    ,formMargin: '10'
    ,formLayout: 'anchor'
    ,layout: 'fit'
    
    ,requires: [
        'Ext.tab.Panel',
        'Ext.layout.container.Border',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Number',
        'Ext.form.FieldContainer'
        
    ]
    
    
    
    ,initComponent() {    
        if(this.controllerCls) {
            this.controller = Ext.create(this.controllerCls);
        } else
        if(!this.controller)
            this.controller = Ext.create('Core.form.FormController');
        
 
        this.items = this.buildForm()
        this.callParent(arguments);
        document.getElementById('main-view-detail-wrap').scrollTop = 0;
        
    }

    
    ,setTitle: function(title) {
        this.down('form').setTitle(title)    
    }
    
    ,buildButtons: function() {
        var me = this;
        return [
            {text: D.t('Save'), iconCls: 'x-fa fa-check', scale: 'medium', action: 'apply'},
            '->',
            {text: D.t('Close'), iconCls: 'x-fa fa-times', scale: 'medium', action: 'gotolist'},
        ]    
    }

    
    ,buildForm: function() {
        return {
            xtype: 'form',
            tbar: this.buildButtons(),
            layout: this.formLayout,
            margin: this.formMargin,
            
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                labelWidth: 150
            },
            items: this.buildAllItems()
        }
    }
    
    ,buildAllItems: function() {
        
        var items = this.buildItems();
        
        if(!Ext.isArray(items)) items = [items]
            
        items.push({
            name: this.controller.model && this.controller.model.idField? this.controller.model.idField:'_id',
            hidden: true
        })
        
        return items;
    }
    
    ,buildItems: function() {return []}
    
    ,addSignButton: function(signobject) {
        var bPanel = this.down('form').getDockedItems('toolbar[dock="top"]')        
        if(bPanel && bPanel[0]) {
            bPanel[0].insert(0, Ext.create('Core.sign.SignButton', {parentView: this, signobject: signobject}))
            bPanel[0].insert(1,'-');
        }
        
    }
    
})