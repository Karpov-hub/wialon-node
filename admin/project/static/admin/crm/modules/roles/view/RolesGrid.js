Ext.define("Crm.modules.roles.view.RolesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Roles"),
  iconCls: "x-fa fa-users",
  filterbar: true,
  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Role"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "role"
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "description"
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
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" }
      }
    ];
  }
});
