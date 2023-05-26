Ext.define('Crm.modules.onlineMonitoring.view.OnlineMonitoringReportsGrid',{
    extend: 'Core.grid.GridContainer',

    title: D.t('Reports in process'),
    iconCls: 'x-fa fa-list',    
    
    buildColumns: function() {
        return [{
            text: D.t("Report ID"),
            flex: 1,
            dataIndex: 'report_id'
        },{
            text: D.t("Username"),
            flex: 1,
            dataIndex: 'user_name'
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