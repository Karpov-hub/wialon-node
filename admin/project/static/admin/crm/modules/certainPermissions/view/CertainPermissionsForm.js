Ext.define("Crm.modules.certainPermissions.view.CertainPermissionsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Permission {id}",
  formMargin: "0",
  iconCls: "x-fa fa-list",
  padding: 10,

  requires: ["Core.form.DependedCombo"],

  controllerCls:
    "Crm.modules.certainPermissions.view.CertainPermissionsFormController",

  buildItems: function() {
    return [
      {
        xtype: "textfield",
        name: "id",
        hidden: true
      },
      this.buildUsersCombo(),
      this.buildReportRoute(),
      this.buildAllowCombo(),
      this.buildResctrictionTypeCombo(),
      {
        name: "ctime",
        xtype: "xdatefield",
        format: D.t("d.m.Y H:i:s O"),
        fieldLabel: D.t("Created time"),
        readOnly: true
      }
    ];
  },

  buildUsersCombo() {
    return {
      xtype: "dependedcombo",
      fieldLabel: D.t("User email"),
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,email",
      valueField: "id",
      displayField: "email",
      name: "user_id",
      allowBlank: false
    };
  },

  buildReportRoute() {
    return {
      xtype: "dependedcombo",
      fieldLabel: D.t("Report name"),
      dataModel: "Crm.modules.routes.model.RoutesModel",
      fieldSet: "id,report_name",
      valueField: "id",
      displayField: "report_name",
      name: "route_id",
      allowBlank: false
    };
  },

  buildAllowCombo: function() {
    return {
      xtype: "combo",
      editable: true,
      valueField: "allow_user",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      fieldLabel: D.t("Allowed Report To User"),
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["allow_user", "text"],
        data: [
          [true, D.t("Allowed")],
          [false, D.t("Not Allowed")]
        ]
      }),
      name: "allow_user",
      allowBlank: false
    };
  },

  buildResctrictionTypeCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "type_restriction",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      fieldLabel: D.t("Type of Resctriction"),
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["type_restriction", "text"],
        data: [
          ["CREATE", D.t("CREATE")],
          ["DOWNLOAD", D.t("DOWNLOAD")]
        ]
      }),
      name: "type_restriction",
      allowBlank: false
    };
  }
});
