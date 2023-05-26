Ext.define("Core.form.FormWindow", {
  extend: "Core.window.Window",

  formMargin: "10",
  formLayout: "anchor",

  requires: [
    "Ext.tab.Panel",
    "Ext.layout.container.Border",
    "Ext.form.field.ComboBox",
    "Ext.form.field.Number",
    "Ext.form.FieldContainer"
  ],

  initComponent: function() {
    if (this.controllerCls) {
      this.controller = Ext.create(this.controllerCls);
    } else if (!this.controller)
      this.controller = Ext.create("Core.form.FormController");

    this.buttons = this.buildButtons();
    this.items = this.buildForm();
    this.callParent(arguments);
  },

  buildButtons: function() {
    var btns = [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash",
        action: "remove"
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square-o",
        scale: "medium",
        action: "save"
      },
      { text: D.t("Save"), iconCls: "x-fa fa-check", action: "apply" },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    if (this.allowCopy)
      btns.splice(1, 0, {
        tooltip: D.t("Make a copy"),
        iconCls: "x-fa fa-copy",
        action: "copy"
      });

    if (this.allowImportExport) {
      btns.splice(1, 0, "-", {
        text: D.t("Export/Import"),
        menu: [
          {
            text: D.t("Export to file"),
            xtype: "button",
            margin: 5,
            action: "exportjson"
          },
          {
            xtype: "filefield",
            buttonOnly: true,
            margin: 5,
            action: "importjson",
            buttonConfig: {
              text: D.t("Import from file"),
              width: "100%"
            }
          }
        ]
      });
    }

    return btns;
  },

  buildForm: function() {
    return {
      xtype: "form",
      layout: this.formLayout,
      margin: this.formMargin,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 150
      },
      items: this.buildAllItems()
    };
  },

  buildAllItems: function() {
    var items = this.buildItems();

    if (!Ext.isArray(items)) items = [items];

    items.push({
      name:
        this.controller &&
        this.controller.model &&
        this.controller.model.idField
          ? this.controller.model.idField
          : "_id",
      hidden: true
    });

    return items;
  },

  buildItems: function() {
    return [];
  },

  addSignButton: function(signobject) {
    var bPanel = this.getDockedItems('toolbar[dock="bottom"]');
    if (bPanel && bPanel[0]) {
      bPanel[0].insert(
        0,
        Ext.create("Core.sign.SignButton", {
          parentView: this,
          signobject: signobject
        })
      );
      bPanel[0].insert(1, "-");
    }
  }
});
