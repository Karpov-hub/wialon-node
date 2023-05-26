Ext.define("Crm.modules.users.view.GroupsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Groups"),
  iconCls: "x-fa fa-users",
  filterbar: true,
  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Group name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Code"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "code"
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "description"
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" }
      },
      {
        text: D.t("Maker"),
        flex: 1,
        sortable: true,
        dataIndex: "maker",
        renderer: function(v, r, e) {
          if (v && v.login) {
            v = v.login;
          } else {
            v = "MAKER IS NOT SETTED";
          }
          return v;
        }
      }
    ];
  }
});
