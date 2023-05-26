
Ext.define('Crm.modules.settings.view.DocsGrid', {
    extend: 'Core.grid.GridContainer',

    title: D.t('Test'),
    iconCls: 'x-fa fa-users',

    
    buildColumns: function() {
        return [{
            text: D.t("name"),
            flex: 1,
            sortable: true,
            dataIndex: 'name'
        },{
            text: D.t("Email"),
            flex: 1,
            sortable: true,
            dataIndex: 'email'
        },{
            text: D.t("Active"),
            flex: 1,
            sortable: true,
            dataIndex: 'active'
        }]        
    }
    
})
