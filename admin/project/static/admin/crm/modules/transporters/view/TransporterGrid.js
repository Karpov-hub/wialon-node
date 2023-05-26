Ext.define("Crm.modules.transporters.view.TransporterGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Transporters"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Host"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "host_transporter"
      },
      {
        text: D.t("Port"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "port_transporter"
      },
      {
        text: D.t("Secure"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "secure_transporter"
      },
      {
        text: D.t("User"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "user_transporter"
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
