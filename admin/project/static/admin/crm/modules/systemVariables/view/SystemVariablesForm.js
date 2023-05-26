Ext.define("Crm.modules.systemVariables.view.SystemVariablesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("System Variable: {code}"),
  formLayout: "fit",
  controllerCls:
    "Crm.modules.systemVariables.view.SystemVariablesFormController",
  formMargin: 0,
  height: 270,
  width: 500,
  syncSize: function() {},

  buildItems() {
    return {
      xtype: "panel",
      padding: 5,
      layout: "anchor",
      defaults: { xtype: "textfield", labelWidth: 85, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "code",
          fieldLabel: D.t("Code"),
          allowBlank: false,
          maxLength: 256,
          minLength: 1
        },
        {
          name: "value",
          fieldLabel: D.t("Value"),
          allowBlank: false,
          maxLength: 1000,
          minLength: 1
        },
        this.buildRealmCombo(),
        {
          name: "ctime",
          fieldLabel: D.t("Created Time"),
          readonly: true,
          xtype: "xdatefield",
          format: D.t("d.m.Y H:i:s O")
        },
        {
          name: "mtime",
          fieldLabel: D.t("Updated Time"),
          readOnly: true,
          xtype: "xdatefield",
          format: D.t("d.m.Y H:i:s O")
        },
        {
          name: "maker",
          fieldLabel: D.t("Maker"),
          readonly: true
        }
      ]
    };
  },
  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      fieldLabel: D.t("Realm"),
      name: "realm_id",
      forceselection: true,
      editable: false,
      allowBlank: false
    });
  },
  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square-o",
        scale: "medium",
        action: "save"
      },

      "-",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        scale: "medium",
        action: "formclose"
      }
    ];
  }
});
