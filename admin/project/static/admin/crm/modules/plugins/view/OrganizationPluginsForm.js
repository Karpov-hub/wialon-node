Ext.define("Crm.modules.plugins.view.OrganizationPluginsForm", {
  extend: "Core.form.FormWindow",
  controllerCls: "Crm.modules.plugins.view.OrganizationPluginsFormController",

  titleTpl: D.t("Organization - Plugins"),
  iconCls: "x-fa fa-cog",

  buildItems: function() {
    return [
      {
        name: "id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("ID")
      },
      {
        name: "organization_id",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "organization_name",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Organization")
      },
      {
        name: "plugin_id",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "plugin_name",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Plugin")
      },
      {
        name: "maker",
        xtype: "textfield",
        readOnly: true,
        editable: true,
        forceSelection: true,
        fieldLabel: D.t("Maker")
      },
      {
        name: "status",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Status")
      },
      {
        name: "reject_reason",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Reject reason")
      },
      {
        name: "plugin_fees",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("Plugin fees"),
        format: "d.m.Y H:i:s O"
      },
      {
        name: "last_activated_date",
        xtype: "xdatefield",
        readOnly: true,
        fieldLabel: D.t("Last date activated"),
        format: "d.m.Y H:i:s O"
      },
      {
        name: "last_deactivated_date",
        xtype: "xdatefield",
        readOnly: true,
        fieldLabel: D.t("Last date deactivated"),
        format: "d.m.Y H:i:s O"
      },
      {
        name: "ctime",
        xtype: "xdatefield",
        readOnly: true,
        fieldLabel: D.t("Create date"),
        format: "d.m.Y H:i:s O"
      }
    ];
  },

  buildButtons: function() {
    var btns = [
      "->",
      {
        text: D.t("Deactivate"),
        iconCls: "x-fa fa-stop",
        action: "deactivate",
        disabled: true
      },
      {
        text: D.t("Approve"),
        iconCls: "x-fa fa-check",
        action: "approve"
      },
      {
        text: D.t("Reject"),
        iconCls: "x-fa fa-times",
        action: "reject"
      },
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        action: "formclose"
      }
    ];
    return btns;
  }
});
