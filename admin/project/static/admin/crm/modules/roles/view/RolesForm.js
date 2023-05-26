Ext.define("Crm.modules.roles.view.RolesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Role: {role}",
  formMargin: "0",
  iconCls: "x-fa fa-users",
  padding: 10,

  requires: ["Ext.grid.column.Check"],

  buildItems: function() {
    return [
      {
        xtype: "textfield",
        name: "id",
        hidden: true
      },
      {
        xtype: "textfield",
        name: "role",
        fieldLabel: D.t("Role *"),
        allowBlank: false
      },
      {
        xtype: "textfield",
        name: "description",
        fieldLabel: D.t("Description")
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
  }
});
