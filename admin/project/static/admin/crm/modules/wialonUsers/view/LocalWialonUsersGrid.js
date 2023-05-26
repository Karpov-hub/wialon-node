
Ext.define('Crm.modules.wialonUsers.view.LocalWialonUsersGrid', {
    extend: "Crm.modules.wialonUsers.view.WialonUsersGrid",

    buildColumns: function () {
        var me=this;
        return [
            {
                text: D.t("Name"),
                flex: 1,
                sortable: true,
                filter: {
                    xtype:'textfield',
                   // maskRe : /[A-Za-z]*$/
                },
                dataIndex: 'name',
                editor: {
                    xtype:'textfield',
                   // maskRe : /[A-Za-z]*$/,
                    allowBlank:false
                }
            },{
                text: D.t("Email"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'email'
            },{
                text: D.t("Role"),
                flex: 1,
                sortable: true,
                filter: true,
                dataIndex: 'role'
            },{
                text: D.t("Organization"),
                sortable: true,
                flex:1,
                filter: false,
                hidden:true,
                hideable: false,
                dataIndex: 'organization_name'
            },
            {
                text: D.t("Organization Id"),
                dataIndex: 'organization_id',
                hidden:true,
                hideable: false
            },
            {
                text: D.t("Role Id"),
                dataIndex: 'role_id',
                hidden:true,
                hideable: false
            },
            {
                text: D.t("Is Active?"),
                sortable: true,
                flex:1,
                dataIndex: 'is_active',
                filter:me.buildActiveCombo(),
                renderer:function(v){
                    return (v)?"Yes":"No";
                }
            }]   
    }

})
