Ext.define("Crm.modules.users.view.UsersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Admins"),
  iconCls: "x-fa fa-users",

  filterbar: true,
  filterable: true,

  requires: ["Core.grid.ComboColumn"],

  buildColumns: function() {
    return [
      {
        text: D.t("Login"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "login"
      },
      {
        xtype: "combocolumn",
        text: D.t("Group"),
        flex: 1,
        filter: true,
        model: "Crm.modules.users.model.GroupsModel",
        dataIndex: "groupid"
      },
      {
        text: D.t("name"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "name"
      },
      {
        text: D.t("Email"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "email"
      },
      {
        text: D.t("Phone"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "tel"
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" }
      } /*,{
            text: D.t("Session password"),
            flex: 1,
            sortable: true,
            dataIndex: 'dblauth',
            renderer: function(v,m) {
                return D.t(v? 'on':'off')    
            }
        }*/
    ];
  }
});
