Ext.define('Crm.modules.onlineMonitoring.view.OnlineMonitoringUsersGrid',{
    extend: 'Core.grid.GridContainer',

    title: D.t('Online users'),
    iconCls: 'x-fa fa-group',    
    
    buildColumns: function() {
        return [{
            text: D.t("User ID"),
            flex: 1,
            dataIndex: 'id'
        },{
            text: D.t("Name"),
            flex: 1,
            dataIndex: 'name'
        },{
            text: D.t("Email"),
            flex: 1,
            dataIndex: 'email'
        }];
    },
    buildTbar() {
        let items = this.callParent();
        items.splice(0, 1);
        return items;
    },

    buildButtonsColumns: function() {
        return [{ }]        
    }
})