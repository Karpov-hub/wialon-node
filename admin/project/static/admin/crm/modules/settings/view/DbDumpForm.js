Ext.define('Crm.modules.settings.view.DbDumpForm', {
    extend: 'Core.form.FormWindow'
    
    ,titleTpl: D.t('Copy Data Base')         
    
    ,requires: [
        'Core.form.DateField',
        'Core.form.TreePicker'
    ]
    
    ,width: 600
    ,height: 250
    ,model: 'Crm.modules.settings.model.DbDumpModel'
    ,controllerCls: 'Crm.modules.settings.view.DbDumpFormController'    
    ,onActivate: function(me) {
                    
    }                
    ,onClose: function(me) {

    }
        
    ,buildItems: function() {
        return [{            
            xtype: 'textfield',            
            fieldLabel: D.t('DB password'),
            inputType: 'password',
            //margin: '0 5 0 0',
            name: 'pass'
        }]
            
    }

    ,buildButtons: function() {
        return [
            {text: D.t('Создать дамп базы данных'), iconCls:'x-fa fa-check', action: 'apply'},
            '->',
            {text: D.t('Close'), iconCls:'x-fa fa-ban', action: 'formclose'}            
            
        ];
    }
    
    ,syncSize: function () {

    }
    
    
    
    
})