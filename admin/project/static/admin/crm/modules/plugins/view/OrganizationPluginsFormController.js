Ext.define("Crm.modules.plugins.view.OrganizationPluginsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=approve]": {
        click: () => {
          this.approvePlugin();
        }
      },
      "[action=reject]": {
        click: () => {
          this.rejectPlugin();
        }
      },
      "[action=deactivate]": {
        click: () => {
          this.deactivatePlugin();
        }
      }
    });
  },
  statusValue(status) {
    switch (status) {
      case 0:
        return D.t("Not requested");
      case 1:
        return D.t("In progress");
      case 2:
        return D.t("Approved");
      case 3:
        return D.t("Rejected");
      case 4:
        return D.t("Deactivated");
      default:
        D.t("Unknown status");
    }
  },
  async setValues(data) {
    if (data.status == 2 || data.status == 3) {
      this.view.down("[action=approve]").setDisabled(true);
      this.view.down("[action=reject]").setDisabled(true);
    }
    if (data.status == 4) {
      this.view.down("[action=approve]").setDisabled(false);
      this.view.down("[action=reject]").setDisabled(true);
      this.view.down("[action=deactivate]").setDisabled(true);
    }
    if (data.status == 2) {
      this.view.down("[action=deactivate]").setDisabled(false);
    }
    if (data.organization_id) {
      data.organization_name = data.organization_id.organization_name;
      data.organization_id = data.organization_id.id;
    }
    if (data.plugin_id) {
      data.plugin_name = data.plugin_id.name;
      data.plugin_id = data.plugin_id.id;
    }
    if (data.status) {
      data.status = this.statusValue(data.status);
    }
    if (data.maker && data.maker.email) {
      data.maker = data.maker.email;
    }
    this.callParent(arguments);
  },
  async approvePlugin() {
    const me = this;
    const model = me.model;
    const form = me.view
      .down("form")
      .getForm()
      .getValues();
    delete form._id;
    let approveWin = Ext.create("Ext.window.Window", {
      title: "Confirmation to APPROVE",
      layout: "fit",
      width: "25%",
      height: "25%",
      modal: true,
      items: [
        {
          xtype: "form",
          layout: "anchor",
          margin: 10,
          items: [
            {
              xtype: "component",
              docked: "top",
              html: "Please enter the amount of the monthly commission that will be included in the invoice for this plugin.",
              padding: "0 0 20 0"
            },
            {
              xtype: "numberfield",
              minValue: 0,
              name: "plugin_fees",
              fieldLabel: D.t("Plugin Fees *"),
              width: "100%",
              labelWidth: 100,
              emptyText: D.t(
                "Please enter the amount fees"
              ),
              allowBlank: false,
              id: "plugin_fees"
            },
            {
              xtype: "fieldcontainer",
              anchor: "100%",
              layout: "hbox",
              // align: "center",
              margin: { top: 15, bottom: 5 },
              items: [
                {
                  xtype: "button",
                  text: D.t("Ok"),
                  formBind: true,
                  listeners: {
                    click: async function (e, v) {
                      const plugin_fees = Ext.getCmp(
                        "plugin_fees"
                      ).getValue();

                      const res = await model.callApi(
                        "plugin-service",
                        "updateStatusOrganizationPlugin",
                        {
                          organization_id: form.organization_id,
                          plugin_id: form.plugin_id,
                          status: 2,
                          plugin_fees
                        }
                      );
                      if (res && res.success) {
                        me.setValues({ status: 3, plugin_fees });
                        approveWin.close();
                        me.view.down("[action=approve]").setDisabled(true);
                        me.view.down("[action=reject]").setDisabled(true);
                        return D.a(
                          "SUCCESS",
                          "Plugin was approved!"
                        );
                      } else {
                        if (res.title && res.message) {
                          return D.a(res.title, res.message);
                        }
                        return D.a(
                          "ERROR",
                          "Something went wrong! Please, contact to Dev/Admin Team!"
                        );
                      }
                    }
                  }
                },
                {
                  xtype: "button",
                  margin: { left: 5 },
                  text: D.t("Cancel"),
                  listeners: {
                    click: () => {
                      approveWin.close();
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }).show();
  },

  async rejectPlugin() {
    let me = this;
    const model = me.model;
    const form = me.view
      .down("form")
      .getForm()
      .getValues();
    let rejectWin = Ext.create("Ext.window.Window", {
      title: "Reject",
      layout: "fit",
      width: "25%",
      height: "25%",
      modal: true,
      items: [
        {
          xtype: "form",
          layout: "anchor",
          margin: 20,
          items: [
            {
              xtype: "textarea",
              width: "100%",
              height: 100,
              labelWidth: 100,
              name: "reject_reason",
              fieldLabel: D.t("Reject Reason *"),
              emptyText: D.t(
                "Please, describe the reason of reject the user"
              ),
              allowBlank: false,
              id: "reject_reason"
            },
            {
              xtype: "fieldcontainer",
              anchor: "100%",
              layout: "hbox",
              align: "center",
              margin: { top: 15, bottom: 5 },
              items: [
                {
                  xtype: "button",
                  text: D.t("Ok"),
                  formBind: true,
                  listeners: {
                    click: async function (e, v) {
                      const reject_reason = Ext.getCmp(
                        "reject_reason"
                      ).getValue();

                      const res = await model.callApi(
                        "plugin-service",
                        "updateStatusOrganizationPlugin",
                        {
                          organization_id: form.organization_id,
                          plugin_id: form.plugin_id,
                          status: 3,
                          reject_reason
                        }
                      );
                      if (res && res.success) {
                        me.setValues({ status: 3, reject_reason });
                        rejectWin.close();
                        me.view.down("[action=approve]").setDisabled(true);
                        me.view.down("[action=reject]").setDisabled(true);
                        return D.a(
                          "SUCCESS",
                          "Status organization plugin was changed!"
                        );
                      } else {
                        if (res.title && res.message) {
                          return D.a(res.title, res.message);
                        }
                        return D.a(
                          "ERROR",
                          "Something went wrong! Please, contact to Dev/Admin Team!"
                        );
                      }
                    }
                  }
                },
                {
                  xtype: "button",
                  margin: { left: 5 },
                  text: D.t("Cancel"),
                  listeners: {
                    click: () => {
                      rejectWin.close();
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }).show();
  },

  async deactivatePlugin() {
    let me = this;
    const form = me.view
      .down("form")
      .getForm()
      .getValues();
    delete form._id;
    const model = me.model;
    Ext.MessageBox.confirm(
      "Confirmation to DEACTIVATE",
      "Are you sure, that you want to deactivate organization plugin?",
      async (btn) => {
        if (btn === "yes") {
          const res = await model.callApi(
            "plugin-service",
            "updateStatusOrganizationPlugin",
            {
              organization_id: form.organization_id,
              plugin_id: form.plugin_id,
              status: 4,
              reject_reason: null
            }
          );
          if (res && res.success) {
            me.setValues({ status: 4, reject_reason: "" });
            return D.a(
              "SUCCESS",
              "Organization plugin was diactivated!"
            );
          } else {
            if (res.title && res.message) {
              return D.a(res.title, res.message);
            }
            return D.a(
              "ERROR",
              "Something went wrong! Please, contact to Dev/Admin Team!"
            );
          }
        }
      }
    );
  }
});
  