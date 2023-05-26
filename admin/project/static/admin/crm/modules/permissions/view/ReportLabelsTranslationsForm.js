Ext.define("Crm.modules.permissions.view.ReportLabelsTranslationsForm", {
  extend: "Core.form.FormWindow",

  onActivate() {},
  onClose() {},
  syncSize() {},

  width: 400,
  height: 300,

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        anchor: "100%"
      },
      items: [
        { name: "id", hidden: true },
        { name: "report_id", hidden: true },
        {
          xtype: "combo",
          editable: false,
          name: "lang",
          displayField: "v",
          valueField: "v",
          fieldLabel: D.t("Language"),
          allowBlank: false,
          store: {
            fields: ["v"],
            data: [{ v: "EN" }, { v: "RU" }]
          }
        },
        {
          name: "report_name",
          fieldLabel: D.t("Report name"),
          allowBlank: false
        },
        {
          xtype: "textarea",
          name: "description",
          fieldLabel: D.t("Description"),
          allowBlank: false,
          grow: true
        }
      ]
    };
  },

  buildButtons() {
    const buttons = this.callParent(arguments);
    buttons[3].action = "save";
    return [buttons[1], buttons[3], buttons[4], buttons[5]];
  }
});
