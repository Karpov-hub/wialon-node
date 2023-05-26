Ext.define("Crm.modules.accountHolders.view.UsersForm", {
  extend: "Core.form.FormWindow",
  //extend: 'main.FormWindow'

  titleTpl: D.t(
    "User: {first_name} {last_name} ({[values.is_active? 'Enabled':'Disabled']})"
  ),
  iconCls: "x-fa fa-user",
  requires: [
    "Desktop.core.widgets.GridField",
    "Core.form.DateField",
    "Core.form.DependedCombo"
  ],
  formLayout: "fit",

  formMargin: 0,

  controllerCls: "Crm.modules.accountHolders.view.UsersFormController",

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [this.buildGeneral()]
    };
  },

  buildGeneral() {
    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "border",
      items: [
        {
          xtype: "panel",
          region: "center",
          layout: "border",
          items: [
            {
              xtype: "panel",
              layout: "anchor",
              split: true,
              region: "center",
              height: 265,

              defaults: {
                anchor: "100%",
                xtype: "textfield",
                margin: 5,
                labelWidth: 110
              },
              items: this.buildUserProfileFields()
            }
          ]
        }
      ]
    };
  },

  buildUserProfileFields() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "type",
        value: 1,
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "textfield",
          flex: 1
        },
        items: [
          {
            name: "name",
            margin: "0 3 0 0",
            fieldLabel: D.t("Name")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "textfield",
          flex: 1
        },
        items: [
          {
            name: "email",
            margin: "0 3 0 0",
            fieldLabel: D.t("E-mail")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "textfield",
          flex: 1
        },
        items: [
          {
            name: "pass",
            inputType: "password",
            //hidden:true,
            margin: "0 3 0 0",
            fieldLabel: D.t("Password")
          }
        ]
      },
      this.buildOraganization(),
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          flex: 1
        },
        items: [this.buildRealmCombo()]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          flex: 1
        },
        items: [this.buildRolesCombo()]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "combo",
          flex: 1
        },
        items: [
          {
            xtype: "combo",
            valueField: "key",
            displayField: "val",
            editable: false,
            store: {
              fields: ["key", "val"],
              data: [
                { key: false, val: D.t("Disabled") },
                { key: true, val: D.t("Activated") }
              ]
            },
            name: "is_active",
            margin: "0 3 0 0",
            fieldLabel: D.t("Status")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "combo",
          flex: 1
        },
        items: [
          {
            xtype: "combo",
            valueField: "key",
            displayField: "val",
            editable: false,
            store: {
              fields: ["key", "val"],
              data: [
                { key: false, val: D.t("Not blocked") },
                { key: true, val: D.t("Blocked") }
              ]
            },
            name: "is_blocked_by_admin",
            margin: "0 3 0 0",
            fieldLabel: D.t("User is blocked")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "xdatefield",
          submitFormat: "Y-m-d",
          format: D.t("m/d/Y"),
          flex: 1
        },
        items: [
          {
            name: "ctime",
            margin: "0 3 0 0",
            fieldLabel: D.t("Reg. date"),
            format: D.t("d.m.Y H:i:s O"),
            readOnly: true
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            xtype: "combo",
            flex: 1,
            valueField: "key",
            displayField: "val",
            editable: false,
            store: {
              fields: ["key", "val"],
              data: [
                { key: "EN", val: D.t("English") },
                { key: "RU", val: D.t("Russian") }
              ]
            },
            name: "preferred_language",
            margin: "0 3 0 0",
            fieldLabel: D.t("Preferred language")
          }
        ]
      }
    ];
  },
  buildOraganization() {
    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      items: [
        Ext.create("Core.form.DependedCombo", {
          fieldLabel: D.t("Organizations"),
          name: "organization_id",
          margin: "0 3 0 0",
          flex: 1,
          dataModel: "Crm.modules.organizations.model.OrganizationsModel",
          fieldSet: "id,organization_name",
          valueField: "id",
          displayField: "organization_name",
          editable: true,
          allowBlank: false
        })
      ]
    };
  },

  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      fieldLabel: D.t("Realm"),
      name: "realm",
      margin: "0 3 0 0"
    });
  },
  buildRolesCombo() {
    return Ext.create("Crm.modules.roles.view.RolesCombo", {
      fieldLabel: D.t("Role"),
      name: "role_id",
      margin: "0 3 0 0"
    });
  }

  // buildCountryCombo() {
  //   return {
  //     xtype: "dependedcombo",
  //     name: "country",
  //     fieldLabel: D.t("Country"),
  //     valueField: "abbr2",
  //     margin: "0 0 0 3",
  //     displayField: "name",
  //     dataModel: "Crm.modules.settings.model.CountriesModel",
  //     fieldSet: "abbr2,name"
  //   };
  // }
  // buildAddress(name, text) {
  //   return {
  //     xtype: "fieldcontainer",
  //     layout: "hbox",
  //     fieldLabel: D.t(text),
  //     defaults: {
  //       xtype: "textfield"
  //     },
  //     items: [
  //       {
  //         name: `${name}_zip`,
  //         margin: "0 3 0 0",
  //         width: 100,
  //         emptyText: D.t("ZIP")
  //       },
  //       {
  //         name: `${name}_address`,
  //         margin: "0 0 0 3",
  //         flex: 1,
  //         emptyText: D.t("city, street, bld.")
  //       }
  //     ]
  //   };
  // },
});
