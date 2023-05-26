Ext.define("Crm.modules.references.view.ReferencesForm", {
  extend: "Core.form.FormWindow",

  model: "Crm.modules.references.model.ReferencesModel",

  titleTpl: "Reference: {name}",
  iconCls: "x-fa fa-list",
  controllerCls: "Crm.modules.references.view.ReferencesFormController",

  formLayout: "border",

  formMargin: 0,

  buildItems: function() {
    var attachPanel = Ext.create("Crm.modules.docs.view.FilesList", {
      name: "files",
      margin: 7.5,
      width: "20%",
      hidden: false,
      split: true,
      region: "east"
    });
    return [
      {
        xtype: "panel",
        region: "center",
        split: true,
        layout: "border",
        items: [
          {
            xtype: "fieldcontainer",
            region: "north",
            layout: "anchor",
            defaults: {
              anchor: "100%",
              xtype: "textfield",
              margin: 5
            },
            items: this.buildFormFields()
          },
          {
            name: "description",
            xtype: "textarea",
            region: "west",
            margin: 5,
            width: "60%",
            fieldLabel: D.t("Description"),
            allowBlank: false
          },
          attachPanel,
          {
            xtype: "panel",
            name: "filelink",
            margin: 5,
            layout: "vbox",
            region: "center",
            width: "20%"
          }
        ]
      }
    ];
  },

  buildFormFields() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: 0,
        items: [
          {
            xtype: "xdatefield",
            margin: 5,
            flex: 1,
            name: "ctime",
            readOnly: true,
            fieldLabel: D.t("Date"),
            format: D.t("d.m.Y H:i:s O")
          },
          {
            margin: 5,
            xtype: "combo",
            name: "lang",
            displayField: "v",
            valueField: "v",
            fieldLabel: D.t("Language"),
            allowBlank: false,
            forceSelection: true,
            editable: false,
            store: {
              fields: ["v"],
              data: [{ v: "EN" }, { v: "RU" }]
            }
          }
        ]
      },
      this.buildReportRoute(),
      this.buildRealmCombo()
    ];
  },
  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm_id",
      allowBlank: false,
      fieldLabel: "Realm"
    });
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Apply"),
        iconCls: "x-fa fa-check-square-o",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  },
  buildReportRoute() {
    return Ext.create("Crm.modules.routes.view.RouteCombo", {
      name: "route_id",
      fieldLabel: D.t("Report Name")
    });
  }
});
