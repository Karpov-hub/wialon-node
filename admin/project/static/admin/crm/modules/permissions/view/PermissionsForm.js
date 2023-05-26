Ext.define("Crm.modules.permissions.view.PermissionsForm", {
  extend: "Core.form.FormContainer",

  layout: "fit",

  titleTpl: D.t("Reports"),
  formMargin: "0",
  iconCls: "x-fa fa-list",

  requires: ["Ext.grid.column.Check"],

  controllerCls: "Crm.modules.permissions.view.PermissionsFormController",

  buildItems() {
    return [
      this.modulesAccessGrid("generic_routes", "Generic"),
      this.modulesAccessGrid("customized_routes", "Customized")
    ];
  },

  modulesAccessGrid(name, title) {
    return {
      region: "center",
      xtype: "grid",
      cls: "email-inbox-panel shadow-panel",
      action: "model-access",
      title: title ? D.t(title) : D.t("Modules"),
      name: name,
      store: Ext.create("Ext.data.Store", {
        fields: ["method", "description", "admin", "user", "organization_id"]
      }),
      columns: [
        {
          text: D.t("Report Name"),
          flex: 1,
          sortable: false,
          filter: true,
          dataIndex: "report_name"
        },
        {
          text: D.t("Method"),
          flex: 1,
          sortable: false,
          filter: true,
          dataIndex: "method"
        },
        {
          text: D.t("Service"),
          flex: 1,
          sortable: false,
          filter: true,
          dataIndex: "service"
        },
        {
          text: D.t("Description"),
          flex: 1,
          sortable: false,
          filter: true,
          dataIndex: "description"
        },
        {
          text: D.t("Requirements"),
          flex: 1,
          sortable: false,
          filter: true,
          dataIndex: "requirements"
        },
        {
          flex: 1,
          xtype: "datecolumn",
          format: "d.m.Y H:i:s O",
          text: D.t("Created time"),
          sortable: true,
          dataIndex: "ctime",
          filter: { xtype: "datefield", format: "d.m.Y" }
        },
        {
          text: D.t("Admin"),
          xtype: "checkcolumn",
          sortable: false,
          flex: 1,
          dataIndex: "admin"
        },
        {
          text: D.t("User"),
          xtype: "checkcolumn",
          sortable: false,
          flex: 1,
          dataIndex: "user"
        },
        {
          text: D.t("Organization"),
          dataIndex: "organization_id",
          hidden: true,
          hideable: false
        },
        {
          xtype: "actioncolumn",
          width: "7%",
          items: [
            {
              iconCls: "x-fa fa-pencil-square-o",
              tooltip: D.t("Edit Route"),
              handler: (grid, rowIndex) => {
                this.fireEvent(
                  "edit_route",
                  grid,
                  grid.getStore().getAt(rowIndex)
                );
              }
            },
            {
              iconCls: "x-fa fa-trash",
              tooltip: D.t("Delete Route"),
              handler: (grid, rowIndex) => {
                this.fireEvent(
                  "delete_route",
                  grid,
                  grid.getStore().getAt(rowIndex)
                );
              }
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    return [
      { text: D.t("Save"), iconCls: "x-fa fa-check", action: "apply" },
      "-",
      {
        tooltip: D.t("Reload Data"),
        iconCls: "x-fa fa-refresh",
        action: "refresh_permissions"
      },
      "-",
      { text: D.t("Add Report"), iconCls: "fa fa-plus", action: "add_route" },
      "-",
      "->",
      this.buildOraganization()
    ];
  },

  buildOraganization(name, value, hidden, width, allowBlank) {
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
      fieldLabel: D.t("Select organization*"),
      labelWidth: 130,
      displayField: "organization_name",
      valueField: "id",
      queryMode: "remote",
      queryParam: "query",
      value: value ? value : "",
      minChars: 2,
      width: width ? "100%" : null,
      anyMatch: true,
      store: this.oraganizationStore,
      allowBlank: allowBlank ? true : false,
      hidden: hidden ? true : false,
      listeners: {
        select: (e, v) => {
          if (v && v.data) {
            this.controller.refreshGridData(v.data.id);
          }
        },
        change: (e, v) => {
          if (!v || v == "") {
            this.controller.refreshGridData();
          }
        }
      }
    };
  }
});
