Ext.define("Crm.modules.organizations.view.OrganizationsForm", {
  extend: "main.FormContainer",

  titleTpl: "Organization: {organization_name}",
  formMargin: "0",
  iconCls: "x-fa fa-users",
  height: "60%",
  padding: 10,

  requires: ["Ext.grid.column.Check"],

  controllerCls: "main.FormController",

  buildItems: function() {
    var me = this;
    return {
      xtype: "tabpanel",
      layout: "fit",
      activeTab: __CONFIG__.organizationCurrentTab || 0,
      items: [
        this.buildProfilePanel(),
        this.buildUsersPanel(),
        this.buildDownalodReportsPanel(),
        this.buildWialonAccountsPanel(),
        this.buildWialonInvoicePanel(),
        this.buildRatesPackagesPanel()
      ],
      listeners: {
        tabchange: function(e, v) {
          __CONFIG__.organizationCurrentTab = v.action;
          if (parseInt(v.action || 0) == 0) {
            if (me.down("[action=refreshFormData]")) {
              me.down("[action=refreshFormData]").setDisabled(false);
            }
            if (me.down("[action=apply]")) {
              if (me.down("form").isValid()) {
                me.down("[action=apply]").setDisabled(false);
              }
            }
          } else {
            if (me.down("[action=apply]")) {
              me.down("[action=apply]").setDisabled(true);
            }
            if (me.down("[action=refreshFormData]")) {
              me.down("[action=refreshFormData]").setDisabled(true);
            }
          }
        }
      }
    };
  },

  buildProfilePanel: function() {
    var me = this;
    return {
      xtype: "panel",
      layout: "anchor",
      title: D.t("Info"),
      action: 0,
      iconCls: "fa fa-info-circle",
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        padding: 10,
        labelWidth: 150
      },
      autoscroll: true,
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "organization_name",
          fieldLabel: D.t("Organization Name*"),
          allowBlank: false
        },
        {
          xtype: "numberfield",
          name: "billing_day",
          value: 28,
          minValue: 1,
          maxValue: 28,
          fieldLabel: D.t("Billing Cycle Date*"),
          allowBlank: false
        },
        me.buildBooleanCombo({
          name: "is_billing_enabled",
          fieldLabel: "Is Invoice Tab Enabled?"
        }),
        me.buildBooleanCombo({
          name: "is_report_template_generator_enabled",
          fieldLabel: "Is Report Tempalte Tab Generator Enabled?"
        }),
        me.buildSandboxStatusCombo(),
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
  },

  buildUsersPanel: function(flag) {
    return {
      xtype: "panel",
      title: D.t("Users"),
      iconCls: "x-fa fa-users",
      layout: "fit",
      autoscroll: true,
      action: 1,
      items: Ext.create("Crm.modules.wialonUsers.view.WialonUsersGrid", {
        title: null,
        iconCls: null,
        scope: this,
        autoscroll: true,
        observe: [{ property: "organization_id", operator: "eq", param: "id" }],
        filterable: false,
        organizationFlag: true,
        createModel: function() {
          return Ext.create(
            "Crm.modules.wialonUsers.model.LocalWialonUsersModel"
          );
        },
        buildButtonsColumns: function() {
          var me = this;
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
                  iconCls: "x-fa fa-eye",
                  tooltip: D.t("See Wialon Accounts"),
                  isDisabled: function(view, rowIndex, colIndex, item, r) {
                    return r.data.role.toString().toLowerCase() == "admin"
                      ? true
                      : false;
                  },
                  handler: function(grid, rowIndex) {
                    me.fireEvent("show_wialon_accounts", grid, rowIndex);
                  }
                }
              ]
            }
          ];
        },
        buildColumns: function() {
          var me = this;
          return [
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
              text: D.t("Email"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "email"
            },
            {
              text: D.t("Role"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "role"
            },
            {
              text: D.t("Organization"),
              sortable: true,
              flex: 1,
              filter: false,
              hidden: true,
              hideable: false,
              dataIndex: "organization_name"
            },
            {
              text: D.t("Organization Id"),
              dataIndex: "organization_id",
              hidden: true,
              hideable: false
            },
            {
              text: D.t("Role Id"),
              dataIndex: "role_id",
              hidden: true,
              hideable: false
            },
            {
              text: D.t("Is Active?"),
              sortable: true,
              flex: 1,
              dataIndex: "is_active",
              filter: me.buildActiveCombo(),
              renderer: function(v) {
                return v ? "Yes" : "No";
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
            }
          ];
        }
      })
    };
  },

  buildDownalodReportsPanel: function(flag) {
    return {
      xtype: "panel",
      title: D.t("Download Reports"),
      iconCls: "x-fa fa-money",
      layout: "fit",
      autoscroll: true,
      action: 1,
      items: Ext.create("Crm.modules.reports.view.ReportsGrid", {
        title: null,
        iconCls: null,
        scope: this,
        autoscroll: true,
        observe: [{ property: "organization_id", operator: "eq", param: "id" }],
        filterable: false,
        organizationFlag: true,
        createModel: function() {
          return Ext.create("Crm.modules.reports.model.LocalReportsModel");
        },
        buildColumns: function() {
          var me = this;
          return [
            {
              text: D.t("Method"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "method"
            },
            {
              text: D.t("Description"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "description"
            },
            {
              text: D.t("Provider"),
              flex: 1,
              sortable: true,
              filter: true,
              hidden: true,
              dataIndex: "provider_id"
            },
            {
              text: D.t("Generated Time"),
              xtype: "datecolumn",
              flex: 1,
              sortable: true,
              filter: {
                xtype: "datefield",
                format: D.t("d/m/Y"),
                submitFormat: "Y/m/d"
              },
              dataIndex: "mtime",
              renderer: function(v, m, r) {
                return Ext.Date.format(new Date(v), "d.m.Y g:i:s");
              }
            }
          ];
        }
      })
    };
  },

  buildWialonAccountsPanel: function() {
    return {
      xtype: "panel",
      title: D.t("Wialon Accounts"),
      iconCls: "x-fa fa-money",
      layout: "fit",
      autoscroll: true,
      action: 2,
      items: Ext.create("Crm.modules.wialonAccounts.view.WialonAccountsGrid", {
        title: null,
        iconCls: null,
        scope: this,
        autoscroll: true,
        observe: [{ property: "organization_id", operator: "eq", param: "id" }],
        filterable: false,
        organizationFlag: true,
        createModel: function() {
          return Ext.create(
            "Crm.modules.wialonAccounts.model.LocalWialonAccountsModel"
          );
        },
        buildColumns: function() {
          var me = this;
          return [
            {
              text: D.t("Wialon Username"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "wialon_username"
            },
            {
              text: D.t("Wialon Token"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "wialon_token"
            },
            {
              text: D.t("Wialon Hosting URL"),
              flex: 1,
              sortable: true,
              filter: true,
              dataIndex: "wialon_hosting_url"
            },
            {
              text: D.t("Organization"),
              sortable: true,
              flex: 1,
              filter: true,
              hidden: true,
              hideable: false,
              dataIndex: "organization_name"
            },
            {
              text: D.t("Organization Id"),
              dataIndex: "organization_id",
              hidden: true,
              hideable: false
            }
          ];
        }
      })
    };
  },

  buildWialonInvoicePanel: function() {
    return {
      xtype: "panel",
      title: D.t("Invoices"),
      iconCls: "x-fa fa-money",
      layout: "fit",
      autoscroll: true,
      action: 4,
      items: Ext.create("Crm.modules.invoices.view.InvoiceGrid", {
        title: null,
        iconCls: null,
        scope: this,
        autoscroll: true,
        observe: [{ property: "organization_id", operator: "eq", param: "id" }],
        filterable: false,
        organizationFlag: true,
        createModel: function() {
          return Ext.create("Crm.modules.invoices.model.LocalInvoiceModel");
        }
      })
    };
  },

  buildRatesPackagesPanel: function() {
    return {
      xtype: "panel",
      title: D.t("Current Package"),
      iconCls: "fa fa-info-circle",
      layout: "fit",
      autoscroll: true,
      action: 5,
      items: Ext.create(
        "Crm.modules.ratesPackages.view.OrganizationRatesPackagesGrid",
        {
          title: null,
          iconCls: null,
          scope: this,
          autoscroll: true,
          observe: [
            { property: "organization_id", operator: "eq", param: "id" }
          ],
          filterable: false,
          organizationFlag: true,
          createModel: function() {
            return Ext.create(
              "Crm.modules.ratesPackages.model.OrganizationRatesPackagesModel"
            );
          }
        }
      )
    };
  },

  buildBooleanCombo: function({ name, fieldLabel }) {
    return {
      xtype: "combo",
      editable: false,
      valueField: "value",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      fieldLabel: D.t(fieldLabel),
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["value", "text"],
        data: [
          [true, D.t("Enabled")],
          [false, D.t("Disabled")]
        ]
      }),
      name,
      allowBlank: false
    };
  },

  buildSandboxStatusCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "value",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      fieldLabel: D.t("Sandbox Access status"),
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["value", "text"],
        data: [
          [1, D.t("Not requested")],
          [2, D.t("Requested")],
          [3, D.t("Approved")],
          [4, D.t("Rejected")],
          [5, D.t("Deactivated")]
        ]
      }),
      name: "sandbox_access_status",
      id: "sandbox_access_status",
      allowBlank: false,
      listeners: {
        change: {
          fn: function(combo, value) {
            let comboElement = document.getElementById(
              "sandbox_access_status-inputEl"
            );
            if (value === 2 || (value.data && value.data.value === 2)) {
              comboElement.style.background = "#f71e0a";
            } else if (value === 3 || (value.data && value.data.value === 3)) {
              comboElement.style.background = "#0be36c";
            } else {
              comboElement.style.background = "white";
            }
          }
        },
        scope: this
      }
    };
  }
});
