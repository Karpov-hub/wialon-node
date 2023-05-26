Ext.define("Crm.modules.support.view.SupportFormController", {
  extend: "Core.form.FormController",

  setValues(data) {
    if (data) {
      if (data && data.status > 0) {
        this.view.down("[action=close_ticket]").setDisabled(true);
        this.view.down("[action=resolve_ticket]").setDisabled(true);
      }
      if (data.status == 0) data.status = "Open";
      else if (data.status == 1) data.status = "Resolved";
      else if (data.status == 2) data.status = "Closed";
      if (data.category == 0) data.category_to_show = "General Questions";
      else if (data.category == 1) data.category_to_show = "Reports";
      else if (data.category == 2) data.category_to_show = "Tarrifs";
    }
    this.callParent(arguments);
  },

  setControls: function() {
    this.control({
      "[action=resolve_ticket]": {
        click: (el) => {
          this.changeStatus(1);
        }
      },
      "[action=close_ticket]": {
        click: (el) => {
          this.changeStatus(2);
        }
      },
      "[action=formclose]": {
        click: (el) => {
          this.changeNew();
        }
      },
      "[action=open_user_profile]": {
        click: (el) => {
          this.openProfile();
        }
      }
    });

    this.callParent(arguments);
  },

  changeStatus: function(status) {
    const recordData = this.view.down("form").getValues();

    let data = {
      id: recordData.id,
      status: status,
      new: 1
    };

    this.model.write(data, () => {
      this.closeView();
    });
  },

  changeNew: function() {
    const recordData = this.view.down("form").getValues();

    let data = {
      id: recordData.id,
      new: 1
    };

    this.model.write(data, () => {
      this.closeView();
    });
  },
  openProfile: function() {
    let e = document.createElement("a");
    const data = this.view.down("form").getValues();
    e.setAttribute(
      "href",
      "/admin/#Crm.modules.accountHolders.view.UsersForm~" + data.user_id + ""
    );
    e.setAttribute("target", "_blank");
    e.click();
  }
});
