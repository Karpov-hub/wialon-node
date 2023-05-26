/**
 * @author Vaibhav Mali
 * @Date : 28 Sept 2018
 */
Ext.define('main.FormContainer', {
  extend: 'Core.form.FormContainer'

   ,initComponent() {    
    var me=this;
    if(this.controllerCls) {
        this.controller = Ext.create(this.controllerCls);
    } else
    if(!this.controller)
        this.controller = Ext.create('Core.form.FormController');
    
   
    this.items = this.buildForm()
    this.callParent(arguments);
    __CONFIG__.organizationCurrentTab=0;
    this.on('render', function () {
        var formPanel = Ext.getCmp('mainFormPanel');
        formPanel.add([{
            xtype: 'textfield',  
            name: 'mtime',
            hidden:true
        }])
        if(__CONFIG__.refreshNeeded){
            if(me&&me.controller&&me.controller.view && me.down('[action=refreshFormData]')){
                me.controller.refreshFormData();
            }
            //window.location.reload();
        } 
    })
   }


   ,controllerCls:'main.FormController'

   
   ,buildForm: function() {
    return {
        xtype: 'form',
        id:'mainFormPanel',
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

  , buildButtons: function () {
        var me = this;
        return [
            {text: D.t('Save'), iconCls: 'x-fa fa-check', scale: 'medium', action: 'apply'},
            '-',
            {
                text: D.t('Close'),
                iconCls: 'x-fa fa-times',
                action: 'gotolist'
            },
            '->',
            {iconCls: 'x-fa fa-refresh', scale: 'medium', action: 'refreshFormData',tooltip: D.t('Refresh Form Data')},        
        ];
        me.setButtonsByPermissions();
    }

        
})