/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */
Ext.define('Crm.modules.messages.view.MessagesForm', {
    extend: 'Core.form.FormWindow'

    ,titleTpl: D.t('Message')
    ,iconCls: 'x-fa fa-envelope-o'

    , requires: [
        //'Ext.ux.form.ItemSelector',
        'Ext.form.field.HtmlEditor',
        'Core.form.DateField',
        //'Ext.data.JsonStore',
        'Ext.form.field.Tag'
    ]

    //,layout: 'border'
    , formLayout: 'border'

    // controller is not needed here becose this is standard module and standard form controller works here
    // , controllerCls: 'Crm.modules.coupons.view.CouponsFormController'

    , buildAllItems: function () {
        var me = this;

        return [{
            xtype: 'panel',
            region: 'north',
            border: false,
            bodyBorder: false,
            layout: 'anchor',
            //bodyStyle: 'padding: 5px;',
            defaults: {
                anchor: '100%',
                labelWidth: 100
            },
            items: [{
                name: '_id',
                xtype: 'textfield',
                hidden: true
            },
            this.buildToCombo()
            , {
                name: 'subject',
                xtype: 'textfield',
                allowBlank: false,
                fieldLabel: D.t('News heading')
            }]
        },{
            name: 'body', 
            region: 'center',
            labelWidth: 100,
            xtype: 'htmleditor',
            enableColors: true,
            enableAlignments: true,
            enableLists: true,
            enableSourceEdit: true,
            fieldLabel: D.t('Message')
        }]
    }
    
    ,buildToCombo: function() {
        return {
            xtype: 'tagfield',
            fieldLabel: D.t('To'),
            store: Ext.create('Core.data.Store', {
                dataModel: 'Crm.modules.users.model.UsersModel',
                fieldSet: '_id,name'    
            }),
            displayField: 'name',
            valueField: '_id',
            queryMode: 'local',
            name: 'to',
            filterPickList: true,
            anchor: '100%'
        }
        
    }
    
    ,buildButtons: function() {
        return [
            {tooltip: D.t('Remove this message'), iconCls:'x-fa fa-trash', action: 'remove'},
            '->',
            {text: D.t('Send'), iconCls:'x-fa fa-paper-plane-o', scale: 'medium', action: 'save'},
            '-',
            {text: D.t('Cancel'), iconCls:'x-fa fa-ban', action: 'formclose'}            
            
        ]
    }
});