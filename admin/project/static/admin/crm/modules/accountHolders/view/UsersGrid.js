Ext.define("Crm.modules.accountHolders.view.UsersGrid", {
  extend: "Core.grid.GridContainer",
  title: D.t("Account Holders"),
  iconCls: "x-fa fa-users",

  filterable: true,
  filterbar: true,

  fields: [
    "id",
    "email",
    "name",
    "role_id",
    "organization_name",
    "organization_id",
    "realm",
    "is_active",
    "ctime",
    "is_blocked_by_admin"
  ],

  buildColumns: function() {
    const renderer = (v, m, r) => {
      if (!r.data.active) {
        m.tdCls = "x-grid-cell-new";
      }
      return v;
    };
    let me = this;
    return [
      {
        text: D.t("E-mail"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "email",
        editor: {
          xtype: "textfield",
          // maskRe : /[A-Za-z]*$/,
          allowBlank: false
        }
      },
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "textfield"
          // maskRe : /[A-Za-z]*$/
        },
        dataIndex: "name",
        editor: {
          xtype: "textfield",
          // maskRe : /[A-Za-z]*$/,
          allowBlank: false
        }
      },
      {
        text: D.t("Organization"),
        flex: 1,
        sortable: true,
        filter: me.buildOraganization(),
        dataIndex: "organization_id",
        renderer: (v, m, r) => {
          return renderer(v ? v.organization_name : "", m, r);
        }
      },
      {
        text: D.t("Role"),
        flex: 1,
        sortable: true,
        filter: me.buildRolesCombo(),
        dataIndex: "role_id",
        renderer: (v, m, r) => {
          return renderer(v ? v.role : "", m, r);
        }
      },
      {
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        filter: me.buildRealmCombo(),
        dataIndex: "realm",
        renderer: (v, m, r) => {
          return renderer(v ? v.name : "", m, r);
        }
      },
      {
        text: D.t("Is Active?"),
        sortable: true,
        flex: 1,
        dataIndex: "is_active",
        filter: me.buildActiveCombo(),
        renderer: function(v) {
          return v ? "Activated" : "Disabled";
        }
      },
      {
        text: D.t("Is Blocked By Admin?"),
        sortable: true,
        flex: 1,
        dataIndex: "is_blocked_by_admin",
        filter: me.buildBlockedCombo(),
        renderer: function(v) {
          return v ? "Blocked" : "Not blocked";
        }
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" }
      }
    ];
  },

  buildFormItems: function(request) {
    return [
      {
        name: "email",
        fieldLabel: D.t("Enter Email*"),
        readOnly: request && request.id ? true : false,
        value: request && request.email ? request.email : "",
        validator: function(v) {
          let emailValidator = /^[a-zA-Z0-9]+[a-zA-Z0-9.!#$%&*+-/=?^_{|}~]*@[a-zA-Z0-9.-]+[a-zA-Z0-9]+\.[a-zA-Z]{2,10}$/;
          return emailValidator.test(v)
            ? true
            : "Please enter email in proper format:user@example.com.";
        },
        allowBlank: false
      },
      {
        name: "pass",
        width: "100%",
        anchor: "100%",
        inputType: "password",
        hidden: request && request.id ? false : true,
        fieldLabel: D.t("Enter Password")
      }
    ];
  },

  buildActiveCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "code",
      displayField: "status",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["code", "status"],
        data: [
          [true, D.t("Activated")],
          [false, D.t("Disabled")]
        ]
      })
    };
  },
  buildBlockedCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "code",
      displayField: "status",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["code", "status"],
        data: [
          [true, D.t("Blocked")],
          [false, D.t("Not blocked")]
        ]
      })
    };
  },
  buildRolesCombo() {
    return Ext.create("Crm.modules.roles.view.RolesCombo", {
      name: "role_id",
      margin: "0 3 0 0"
    });
  },
  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm",
      margin: "0 3 0 0"
    });
  },
  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: this.buttonEditTooltip,
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-trash",
            tooltip: this.buttonDeleteTooltip,
            isDisabled: function() {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildOraganization: function(name, value, request) {
    let me = this;
    this.oraganizationStore = Ext.create("Core.data.Store", {
      dataModel: Ext.create(
        "Crm.modules.organizations.model.OrganizationsComboModel"
      ),
      fieldSet: ["organization_name", "id"],
      forceSelection: false,
      allowBlank: false,
      scope: this
    });
    return {
      xtype: "combo",
      name: name ? name : "organization_name",
      // fieldLabel: D.t('Select Organization'),
      displayField: "organization_name",
      valueField: "id",
      queryMode: "remote",
      queryParam: "query",
      triggerAction: "query",
      typeAhead: true,
      value: value ? value : "",
      minChars: 2,
      width: "100%",
      anyMatch: true,
      store: this.oraganizationStore,
      allowBlank: false,
      readOnly: me.organizationFlag
        ? true
        : request && request.id
        ? true
        : false,
      forceSelection: true
    };
  }
});
