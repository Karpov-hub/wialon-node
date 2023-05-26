Ext.define("Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountsFormController", {
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
          this.updateStatus(3)
        }
      },
      "[action=reject]": {
        click: () => {
          this.updateStatus(1)
        }
      }
    });
  },
  statusValue(status) {
    switch (status) {
      case 1:
        return D.t("Not approved");
      case 2:
        return D.t("In progress");
      case 3:
        return D.t("Approved");
      default:
        D.t("Unknown status")
    }
  },
    async setValues(data) {
      if (data.organization_id) {
        data.organization_id = data.organization_id.organization_name;
      }
      if (data.aggregator_id) {
        data.aggregator_id = data.aggregator_id.name;
      }
      if (data.status) {
        data.status = this.statusValue(data.status)
      }
      if (data.maker && data.maker.email) {
        data.maker = data.maker.email;
      }
      this.callParent(arguments);
    },
  async updateStatus(status) {
    let me = this;
    const form = me.view
      .down("form")
      .getForm()
      .getValues();
    delete form._id;
    const model = me.model
    Ext.MessageBox.confirm(
      "Confirmation to APPROVE",
      "Are you sure, that you want to change status organization aggregator account?",
      async (btn) => {
        if (btn === "yes") {
          const res = await model.callApi(
            "aggregator-service",
            "updateStatusOrganizationAggregatorAccount",
            {
              organization_aggregator_account_id: form.id,
              status
            }
          );
          if (res && res.success) {
            form.status = me.setValues({status})
            this.view.down("[action=approve]").setDisabled(true);
            this.view.down("[action=reject]").setDisabled(true);
            return D.a(
              "SUCCESS",
              "Status organization aggregator account was changed!"
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

});
  