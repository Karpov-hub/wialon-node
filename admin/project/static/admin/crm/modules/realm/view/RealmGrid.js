Ext.define("Crm.modules.realm.view.RealmGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Realms"),
  iconCls: "x-fa fa-venus-mars",

  buildColumns: function() {
    return [
      {
        text: D.t("name"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      },
      {
        text: D.t("IP adderss"),
        flex: 1,
        sortable: true,
        dataIndex: "ip"
      },
      {
        text: D.t("Domain"),
        flex: 1,
        sortable: true,
        dataIndex: "domain"
      },
      {
        text: D.t("Token"),
        flex: 1,
        sortable: true,
        dataIndex: "token"
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
