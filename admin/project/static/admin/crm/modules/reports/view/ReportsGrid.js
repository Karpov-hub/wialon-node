Ext.define("Crm.modules.reports.view.ReportsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Download Reports"),
  iconCls: "x-fa fa-list",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: false,

  controllerCls: "Crm.modules.reports.view.ReportsGridController",

  buildColumns: function() {
    var me = this;
    return [
      {
        text: D.t("Method"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "method"
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "description"
      },
      {
        text: D.t("Oraganization"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "organization_name"
      },
      {
        text: D.t("Provider"),
        flex: 1,
        sortable: true,
        filter: true,
        hidden: true,
        dataIndex: "provider_id"
      },
      {
        text: D.t("Generated Time"),
        xtype: "datecolumn",
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: D.t("d/m/Y"),
          submitFormat: "Y/m/d"
        },
        dataIndex: "mtime",
        renderer: function(v, m, r) {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s O");
        }
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push("-", {
      tooltip: D.t("Reload Data"),
      iconCls: "x-fa fa-refresh",
      action: "refresh",
      text: D.t("Refresh")
    });
    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 64,
        items: [
          {
            iconCls: "x-fa fa-download",
            tooltip: D.t("Download Report"),
            // isDisabled: function() {
            //   return !me.permis.modify && !me.permis.read;
            // },
            handler: function(grid, rowIndex) {
              me.fireEvent("download_report", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
