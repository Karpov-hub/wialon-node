Ext.define("Crm.modules.logsForApi.view.LogsForApiForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Log record") + ": {action}|{id}",
  iconCls: "x-fa fa-key",
  controllerCls: "Crm.modules.logsForApi.view.LogsForApiFormController",

  buildItems: function() {
    return [
      {
        name: "id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("ID")
      },
      {
        name: "action",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Action")
      },
      {
        name: "user_id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("User")
      },
      {
        name: "message",
        xtype: "textarea",
        readOnly: true,
        fieldLabel: D.t("Message")
      },
      {
        name: "data",
        xtype: "textarea",
        readOnly: true,
        fieldLabel: D.t("Data")
      },
      {
        xtype: "xdatefield",
        name: "ctime",
        fieldLabel: D.t("Created time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        readOnly: true
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
