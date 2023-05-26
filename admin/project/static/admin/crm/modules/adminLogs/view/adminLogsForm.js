Ext.define("Crm.modules.adminLogs.view.adminLogsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Log") + ": {date}",
  iconCls: "x-fa fa-list",

  controllerCls: "Crm.modules.adminLogs.view.adminLogsFormController",
  onActivate: function() {},
  onClose: function() {},

  buildItems: function() {
    return [
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            name: "data",
            xtype: "textarea",
            readOnly: true,
            height: 500,
            flex: 1,
            margin: "0 5 0 0",
            fieldLabel: D.t("Data")
          },
          {
            name: "result",
            xtype: "textarea",
            readOnly: true,
            flex: 1,
            height: 500,
            margin: "0 0 0 5",
            fieldLabel: D.t("Result")
          }
        ]
      }
    ];
  },

  buildButtons: function() {
    var btns = [
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    return btns;
  }
});
