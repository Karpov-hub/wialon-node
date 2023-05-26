
Ext.define('Crm.modules.settings.view.DocTypeGrid', {
    extend: 'Core.grid.GridContainer',

    title: D.t('Documents Types'),
    iconCls: 'x-fa fa-cogs',

    
    buildColumns: function() {
        return [{
            text: D.t("Document type"),
            flex: 1,
            sortable: true,
            dataIndex: 'name'
        },{
            text: D.t("Organisation type"),
            flex: 1,
            sortable: true,
            dataIndex: 'orgtype',
            renderer: function(v) {
                return D.t({'1': 'Foundation', '2': 'Partner'}[v] || '')
            }
        },{
            text: D.t("Lifetime"),
            width: 80,
            sortable: true,
            dataIndex: 'lifetime'
        },{
            text: D.t("Active"),
            width: 80,
            sortable: true,
            dataIndex: 'active'
        }]        
    }
    
})
