Ext.define("Crm.modules.letterTemplates.view.letterTemplatesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Template: {letter_name}"),
  iconCls: "x-fa fa-envelope-o",
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,
  allowImportExport: true,

  controllerCls:
    "Crm.modules.letterTemplates.view.letterTemplatesFormController",

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [this.buildGeneral(), this.buildPreview()]
    };
  },

  buildPreview() {
    this.previewPanel = Ext.create("Ext.panel.Panel", {
      region: "center",
      html:
        '<iframe width="100%" height="100%" frameborder="0" style="border: null"></iframe>'
    });

    return {
      xtype: "panel",
      title: D.t("Template editor"),
      layout: "border",
      bodyStyle: "background: #ffffff",
      items: [
        {
          xtype: "fieldcontainer",
          layout: "border",
          region: "north",
          split: true,
          height: "50%",
          items: [
            {
              xtype: "tabpanel",
              layout: "fit",
              tabBarPosition: "bottom",
              region: "center",
              items: [
                {
                  xtype: "panel",
                  title: D.t("HTML version"),
                  layout: "fit",
                  items: {
                    xtype: "textarea",
                    name: "html",
                    labelWidth: 150,
                    style: "background:#ffffff",
                    emptyText: D.t("Template (PUG format)")
                  }
                },
                {
                  xtype: "panel",
                  title: D.t("Text version"),
                  layout: "fit",
                  items: {
                    xtype: "textarea",
                    name: "text",
                    labelWidth: 150,
                    style: "background:#ffffff",
                    emptyText: D.t("Template (PUG format)")
                  }
                }
              ]
            },
            {
              xtype: "textarea",
              region: "east",
              width: "50%",
              split: true,
              name: "data",
              style: "background:#ffffff",
              emptyText: D.t("Data example")
            }
          ]
        },
        this.previewPanel
      ]
    };
  },

  buildGeneral() {
    return {
      title: D.t("General settings"),
      xtype: "panel",
      padding: 5,

      layout: "anchor",
      defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              flex: 1,
              xtype: "textfield",
              name: "code",
              labelWidth: 150,
              margin: "0 10 0 0",
              fieldLabel: D.t("Code")
            },
            Ext.create("Crm.modules.realm.view.RealmCombo", {
              name: "realm",
              flex: 1,
              margin: "0 10 0 0"
            }),
            {
              xtype: "combo",
              width: 150,
              labelWidth: 80,
              name: "lang",
              fieldLabel: D.t("Language"),
              displayField: "code",
              valueField: "code",
              value: "en",
              store: {
                fields: ["code"],
                data: [{ code: "en" }, { code: "ru" }]
              }
            }
          ]
        },

        {
          name: "letter_name",
          fieldLabel: D.t("Letter name")
        },
        {
          name: "from_email",
          fieldLabel: D.t("From email")
        },
        {
          name: "to_email",
          fieldLabel: D.t("To email")
        },

        {
          name: "subject",
          fieldLabel: D.t("Subject")
        },

        {
          xtype: "combo",
          name: "transporter",
          fieldLabel: D.t("Transporter"),
          valueField: "id",
          displayField: "host_transporter",
          queryMode: "local",
          flex: 1,
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create(
              "Crm.modules.transporters.model.TransporterModel"
            ),
            fieldSet: ["id", "host_transporter"],
            scope: this
          })
        },
        {
          xtype: "xdatefield",
          name: "ctime",
          fieldLabel: D.t("Created time"),
          format: D.t("d.m.Y H:i:s O"),
          flex: 1,
          readOnly: true
        }
      ]
    };
  }
});
