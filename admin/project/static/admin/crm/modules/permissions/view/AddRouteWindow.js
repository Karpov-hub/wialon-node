Ext.define("Crm.modules.permissions.view.AddRouteWindow", {
  extend: "Ext.window.Window",

  title: "Add Report",
  layout: "fit",

  width: "50%",
  height: "70%",

  autoShow: true,
  modal: true,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create("Crm.modules.permissions.model.PermissionsModel");

    this.callParent(arguments);
  },

  buildItems() {
    return {
      xtype: "form",
      layout: "anchor",
      margin: 20,
      defaults: { xtype: "textfield", anchor: "100%", labelWidth: 130 },
      items: [
        this.buildOraganization(),
        this.buildTypeCombo(),
        {
          name: "report_name",
          maxLength: 250,
          fieldLabel: D.t("Report Name *"),
          allowBlank: false
        },
        {
          name: "method",
          fieldLabel: D.t("Enter Method Name*"),
          allowBlank: false,
          validator: function(v) {
            if (v && v.toString() && v.toString().trim() != "") {
              if (
                v
                  .toString()
                  .trim()
                  .split(" ").length >= 2
              ) {
                return "Route is invalid(Please do not enter space).";
              } else {
                return true;
              }
            } else {
              return "Route is invalid.";
            }
          }
        },
        {
          name: "service",
          maxLength: 250,
          fieldLabel: D.t("Enter Service *"),
          allowBlank: false
        },
        {
          xtype: "textarea",
          name: "description",
          maxLength: 255,
          fieldLabel: D.t("Enter Description")
        },
        {
          xtype: "textarea",
          name: "requirements",
          maxLength: 250,
          fieldLabel: D.t("Enter Requirements")
        },
        {
          name: "report_id",
          maxLength: 250,
          fieldLabel: D.t("Report ID"),
          validator: (v) => {
            return this.validateUUID(v);
          }
        }
      ]
    };
  },

  buildTypeCombo() {
    return {
      xtype: "combo",
      fieldLabel: D.t("Select Type *"),
      name: "type",
      queryMode: "local",
      displayField: "text",
      valueField: "id",
      editable: false,
      allowBlank: false,
      value: 1,
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["text", "id"],
        data: [
          ["Generic", 1],
          ["Customized", 2]
        ]
      }),
      listeners: {
        change: (e, v) => {
          const organizationIdField = this.down("[name=organization_id]");
          if (organizationIdField) {
            if (v && v == 1) {
              organizationIdField.setVisible(false);
              organizationIdField.allowBlank = true;
              organizationIdField.setValue("");
            } else {
              organizationIdField.setVisible(true);
              organizationIdField.allowBlank = false;
              organizationIdField.setValue(this.formData.organization_id);
            }
          }
        }
      }
    };
  },

  buildOraganization() {
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
      name: "organization_id",
      fieldLabel: D.t("Select Organization *"),
      displayField: "organization_name",
      valueField: "id",
      queryMode: "remote",
      queryParam: "query",
      value: this.formData.organization_id,
      minChars: 2,
      width: "100%",
      anyMatch: true,
      store: this.oraganizationStore,
      allowBlank: true,
      hidden: true,
      forceSelection: true,
      listeners: {
        select: () => {
          const serviceField = this.down("[name=service]");
          if (serviceField) {
            const serviceFieldValue = serviceField.getValue();
            serviceField.setValue("");
            serviceField.setValue(serviceFieldValue);
          }
        }
      }
    };
  },

  validateUUID(v) {
    if (
      v.match(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
      ) === null
    ) {
      return "Invalid value (should be UUID)";
    }
    return true;
  },

  validateForm() {
    const items = this.down("form")
      .getForm()
      .getFields().items;
    const out = [];

    for (const item of items) {
      if (item && item.activeErrors && item.activeErrors.length) {
        out.push(` <b>${item.fieldLabel}</b>: ${item.activeErrors[0]}`);
      }
    }

    return out.length == 0 ? true : D.a("Error", out);
  },

  async saveRoute() {
    const formValid = this.validateForm();
    if (formValid !== true) return formValid;

    const formData = this.down("form").getValues();
    const res = await this.model.addNewRoute(formData);

    if (res.error) {
      return D.a(
        "Error",
        res && res.error && res.error.message
          ? res.error.message
          : "Something went wrong."
      );
    }

    if (res.validationErrors) {
      const errorHtml = this.buildHtmlError(res.validationErrors);
      return D.a("Validations Errors:", errorHtml);
    }

    this.callback();
    this.close();

    D.a("Success", "New route added successfully.");
  },

  buildHtmlError(errors) {
    let errorHtml = '<table border="1"><tr><th>field</th><th>Error</th></tr>';
    errors.forEach((error) => {
      errorHtml +=
        "<tr><td>" + error.field + "</td><td>" + error.message + "</tr>";
    });
    errorHtml += "</table>";

    return errorHtml;
  },

  buildButtons() {
    return [
      {
        text: D.t("Save"),
        handler: () => {
          this.saveRoute();
        }
      },
      {
        text: D.t("Cancel"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
