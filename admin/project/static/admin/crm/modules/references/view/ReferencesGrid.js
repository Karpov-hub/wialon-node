Ext.define("Crm.modules.references.view.ReferencesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Reference"),
  iconCls: "x-fa fa-info-circle",
  detailsInDialogWindow: true,
  controllerCls: "Crm.modules.references.view.ReferencesGridController",

  filterbar: true,
  layout: "fit",

  buildColumns: function() {
    return [
      {
        text: D.t("Report"),
        flex: 1,
        sortable: true,
        filter: this.buildReportRoute(),
        dataIndex: "route_id",
        renderer: function(v, m, r) {
          if (v && v.report_name) {
            v = v.report_name;
          }
          return v;
        }
      },
      {
        dataIndex: "file_id",
        hidden: true
      },
      {
        text: D.t("Description"),
        flex: 2,
        sortable: true,
        dataIndex: "description",
        filter: true
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
        text: D.t("Language"),
        flex: 1,
        sortable: true,
        dataIndex: "lang",
        filter: true
      }
    ];
  },
  buildReportRoute() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.routes.model.RoutesModel",
      fieldSet: "id,report_name",
      valueField: "id",
      displayField: "report_name",
      name: "route_id",
      forceSelection: true
    };
  }
});
