Ext.define("Crm.modules.permissions.view.EditRouteWindow", {
  extend: "Ext.window.Window",

  title: "Edit Report",
  layout: "fit",

  width: "50%",
  height: "80%",

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
      xtype: "tabpanel",
      layout: "anchor",
      name: "editwin-tabpanel",
      items: [
        {
          title: D.t("General Info"),
          xtype: "form",
          layout: "anchor",
          margin: 20,
          defaults: { xtype: "textfield", anchor: "100%", labelWidth: 130 },
          items: [
            {
              name: "id",
              value: this.formData.id,
              allowBlank: false,
              fieldLabel: D.t("Route ID"),
              readOnly: true
            },
            {
              name: "report_name",
              value: this.formData.report_name,
              maxLength: 250,
              fieldLabel: D.t("Report Name *"),
              allowBlank: false
            },
            {
              name: "method",
              value: this.formData.method,
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
              value: this.formData.service,
              name: "service",
              maxLength: 250,
              fieldLabel: D.t("Enter Service *"),
              allowBlank: false
            },
            {
              xtype: "textarea",
              value: this.formData.description,
              name: "description",
              maxLength: 500,
              fieldLabel: D.t("Enter Description")
            },
            {
              xtype: "textarea",
              value: this.formData.requirements,
              name: "requirements",
              maxLength: 250,
              fieldLabel: D.t("Enter Requirements")
            },
            {
              value: this.formData.report_id,
              name: "report_id",
              maxLength: 250,
              fieldLabel: D.t("Report ID"),
              validator: (v) => {
                return this.validateUUID(v);
              }
            },
            {
              value: this.formData.jasper_report_code,
              name: "jasper_report_code",
              maxLength: 255,
              fieldLabel: D.t("Jasper Report Code")
            },
            this.buildFormatsCombo(this.formData)
          ]
        },
        {
          xtype: "panel",
          layout: "anchor",
          title: D.t("Labels languages"),
          items: [
            {
              name: "id",
              value: this.formData.id,
              hidden: true
            },
            Ext.create(
              "Crm.modules.permissions.view.ReportLabelsTranslationsGrid",
              {
                scope: this,
                observe: [
                  { property: "report_id", operator: "eq", param: "id" }
                ]
              }
            )
          ]
        }
      ]
    };
  },

  buildFormatsCombo(data) {
    return {
      xtype: "tagfield",
      fieldLabel: D.t("Formats"),
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["name"],
        data: [["xlsx"], ["docx"], ["pdf"], ["html"]]
      }),
      id: "formats",
      value: data.formats || [],
      displayField: "name",
      queryMode: "local",
      name: "formats",
      filterPickList: true,
      anchor: "100%",
      forceSelection: true,
      editable: false,
      selectOnFocus: false
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

    const reqData = this.down("form").getValues();

    const res = await this.model.editRoute(reqData);

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

    D.a("Success", "Route updated successfully.");
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
