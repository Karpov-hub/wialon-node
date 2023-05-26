
Ext.define('Crm.modules.users.view.ModulesGrid', {
    extend: 'Core.grid.EditableGrid',

    title: D.t('Group Modules'),
    iconCls: 'x-fa fa-map-marker',
    
    importButton: true,
    requires: [
        'Core.grid.ComboColumn'    
    ],
    
    buildColumns: function() {
        return [{
            text: D.t("Model name"),
            flex: 1,
            sortable: true,
            dataIndex: 'name',
            filter: true,
            editor: true
        },{
            text: D.t("Category"),
            dataIndex: 'category',
            flex: 1,
            editor: {
                xtype: 'combobox',
                displayField: 'key',
                valueField: 'key',
                queryMode: 'local',
                store: Ext.create('Ext.data.Store', {
                    fields: ['key', 'text'],
                    data: [
                        { key: 'API_ACCESS', text: 'API Access' },
                        { key: 'MODEL_ACCESS', text: 'Model Access' },
                        { key: 'PAGE_ACCESS', text: 'Page Access' }
                    ]
                })
            }
        }]
    }   
})
