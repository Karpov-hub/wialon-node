Ext.define('Crm.modules.settings.view.DocTypeForm', {
    extend: 'Core.form.FormWindow'
    
    ,titleTpl: 'Document type: {name}'
    ,iconCls: 'x-fa fa-cogs'
    
    ,requires: ['Ext.form.field.Number']
        
    ,buildItems: function() {
        return [{
            name: 'name',
            fieldLabel: D.t('Document type')
        },{
            name: 'description',
            fieldLabel: D.t('Description')
        },{
            name: 'lifetime',
            value: 0,
            fieldLabel: D.t('Lifetime (days)'),
            xtype: 'numberfield'
        },
        this.orgTypeCombo(),
        {
            name: 'active',
            fieldLabel: D.t('Active'),
            xtype: 'checkbox'
        }]
    }
    
    ,orgTypeCombo: function() {
        
         return {
             xtype: 'combo',
             name: 'orgtype',
             fieldLabel: D.t('Organisation type'),
             valueField: 'code',
             displayField: 'name',
             queryMode: 'local',
             store: Ext.create('Ext.data.ArrayStore', {
                 fields: ['code', 'name'],
                 data: [['1','Foundation'],['2','Partner']]
             })
         }
            
    }
    
    
})