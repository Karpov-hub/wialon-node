Ext.define('Crm.modules.test.view.TestForm', {
    extend: 'Core.form.FormWindow'
    
    ,titleTpl: 'User: {login}'

        
    ,buildItems: function() {
        return [{
            name: 'name',
            fieldLabel: D.t('User name')
        },{
            name: 'email',
            fieldLabel: D.t('Email')
        }]
    }
    
    
    
})