Ext.define("Crm.modules.signset.view.SignsetGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Workflow"),
  iconCls: "x-fa fa-briefcase",

  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Module"),
        flex: 1,
        sortable: true,
        dataIndex: "module"
      },
      {
        text: D.t("Active"),
        width: 70,
        sortable: true,
        dataIndex: "active"
      }
    ];
  }
});
