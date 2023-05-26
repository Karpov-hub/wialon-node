Ext.define(
  "Crm.modules.requestToRegistration.view.RequestToRegistrationFormController",
  {
    extend: "Core.form.FormController",
    syncSize() {},
    setControls() {
      this.control({
        "[action=formclose]": {
          click: (el) => {
            this.closeView();
          }
        },
        "[action=approve]": {
          click: (el) => {
            this.approveUser();
          }
        },
        "[action=reject]": {
          click: (el) => {
            console.log(el);
            this.rejectUser();
          }
        }
      });
      this.callParent(arguments);
    },

    setValues(data) {
      if (
        data &&
        data.is_wialon_accounts_exists != undefined &&
        data.is_wialon_accounts_exists != null
      ) {
        if (data.is_wialon_accounts_exists) {
          data.is_wialon_accounts_exists_to_show = "Yes";
        }
        if (!data.is_wialon_accounts_exists) {
          data.is_wialon_accounts_exists_to_show = "No";
        }
      }

      if (data.status != 0) {
        this.view.down("[action=approve]").setDisabled(true);
        this.view.down("[action=reject]").setDisabled(true);
      }

      if (data.status === 2) {
        this.view.down("[name=reject_reason]").setHidden(false);
      }

      if (data.status === 0) {
        data.status_to_show = "PENDING";
      } else if (data.status === 1) {
        data.status_to_show = "APPROVED";
      } else if (data.status === 2) {
        data.status_to_show = "REJECTED";
      }

      if (data.realm_id && data.realm_id.name) {
        data.realm_to_show = data.realm_id.name;
        data.realm_id = data.realm_id.id;
      }
      this.callParent(arguments);
    },

    async approveUser() {
      let me = this;
      const form = me.view
        .down("form")
        .getForm()
        .getValues();
      delete form._id;

      form.id_of_record = form.id;
      delete form.id;

      form.organization_name = form.company;
      delete form.company;

      Ext.MessageBox.confirm(
        "Confirmation to APPROVE",
        "Are you sure, that you want to approve user and create to them account in the system?",
        async (btn) => {
          if (btn === "yes") {
            const res = await this.model.callApi(
              "auth-service",
              "signupAdminFromAdminPanel",
              form,
              form.realm_id
            );
            if (res && res.success) {
              this.view.down("[action=approve]").setDisabled(true);
              this.view.down("[action=reject]").setDisabled(true);
              return D.a(
                "SUCCESS",
                "User was registrated successfully! Inform an user check them email."
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
          } else {
            this.view.closeView();
          }
        }
      );
    },
    async rejectUser() {
      let me = this;
      const form = me.view
        .down("form")
        .getForm()
        .getValues();
      delete form._id;
      form.status = 2;
      let rejectUserWin = Ext.create("Ext.window.Window", {
        title: "Reject User",
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
                      click: async function(e, v) {
                        const reject_reason = Ext.getCmp(
                          "reject_reason"
                        ).getValue();

                        form.reject_reason = reject_reason;
                        const res = await me.model.callApi(
                          "auth-service",
                          "rejectUserRequest",
                          form,
                          form.realm_id
                        );
                        if (res && res.success) {
                          me.view.down("[action=approve]").setDisabled(true);
                          me.view.down("[action=reject]").setDisabled(true);
                          D.a(
                            "SUCCESS",
                            "User request was successfully rejected and informed of user on them email."
                          );
                          rejectUserWin.close();
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
                        rejectUserWin.close();
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }).show();
    }
  }
);
