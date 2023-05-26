Ext.define("Crm.modules.permissions.view.PermissionsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.callParent(arguments);

    this.control({
      "[xtype=checkcolumn]": {
        headerclick: this.onCheckColumnsClick
      },
      "[action=refresh_permissions]": {
        click: (e, v) => {
          this.refreshGridData();
        }
      },
      "[action=add_route]": {
        click: (e, v) => {
          this.addNewRoute();
        }
      }
    });

    this.view.on("edit_route", (grid, rec) => {
      this.editRoute(rec.data);
    });

    this.view.on("delete_route", (grid, rec) => {
      this.deleteRoute(rec.data);
    });
  },

  addNewRoute() {
    let organization_id = null;

    const organizationNameField = this.view.down("[name=organization_name]");
    if (organizationNameField) {
      organization_id = organizationNameField.getValue();
    }

    Ext.create("Crm.modules.permissions.view.AddRouteWindow", {
      formData: {
        organization_id
      },
      callback: async () => {
        this.refreshGridData();
      }
    });
  },

  editRoute(data) {
    Ext.create("Crm.modules.permissions.view.EditRouteWindow", {
      formData: data,
      callback: async () => {
        this.refreshGridData();
      }
    });
  },

  deleteRoute(data) {
    D.c("Removing", "Delete the route?", [], async () => {
      const res = await this.model.deleteRoute(data);

      if (res.error) {
        return D.a(
          "Error",
          res.error && res.error.message
            ? res.error.message
            : "Something went wrong."
        );
      }

      D.a("Success", "Route deleted successfully.");
      this.refreshGridData();
    });
  },

  collectGridDataToSave(obj, name) {
    obj[name] = [];

    this.view
      .down("[name=" + name + "]")
      .getStore()
      .each(function(item) {
        obj[name].push({
          id: item.data.id || null,
          method: item.data.method || null,
          super_admin: item.data.super_admin,
          admin: item.data.admin,
          user: item.data.user,
          organization_id: item.data.organization_id
        });
      });
  },

  afterDataLoad(data, cb) {
    this.refreshGridData();
    cb();
  },

  async refreshGridData(organization_id) {
    const organizationNameField = this.view.down("[name=organization_name]");

    if (!organization_id && organizationNameField) {
      organization_id = organizationNameField.getValue();
    }

    if (!organization_id) {
      this.setGridStore([], "generic_routes");
      this.setGridStore([], "customized_routes");
      return;
    }

    const res = await this.model.getRouteswithPermissionsList({
      organization_id: organization_id || null
    });

    if (res && res.error) {
      return D.a(
        "Error",
        res && res.error && res.error.message
          ? res.error.message
          : "Something went wrong."
      );
    }

    if (res) {
      this.setGridStore(res.generic_routes || [], "generic_routes");
      this.setGridStore(res.customized_routes || [], "customized_routes");
    } else {
      this.setGridStore([], "generic_routes");
      this.setGridStore([], "customized_routes");
    }
  },

  setGridStore(data, gridName) {
    const store = this.view.down("[name=" + gridName + "]").getStore();
    store.clearData();
    store.loadData(data);
  },

  async save(closewin, cb) {
    const form = this.view.down("form").getForm();
    let data = {};

    const sb1 = this.view.down("[action=save]"),
      sb2 = this.view.down("[action=apply]");

    if (sb1 && !!sb1.setDisabled) sb1.setDisabled(true);
    if (sb2 && !!sb2.setDisabled) sb2.setDisabled(true);

    if (form) {
      data = form.getValues();
    }

    let setButtonsStatus = function() {
      if (sb1 && !!sb1.setDisabled) sb1.setDisabled(false);
      if (sb2 && !!sb2.setDisabled) sb2.setDisabled(false);
    };

    if (this.view.fireEvent("beforesave", this.view, data) === false) {
      setButtonsStatus();
      return;
    }

    let reqData = {};

    this.collectGridDataToSave(reqData, "generic_routes");
    this.collectGridDataToSave(reqData, "customized_routes");

    data.routes = [];
    data.routes = data.routes.concat(reqData.generic_routes);
    data.routes = data.routes.concat(reqData.customized_routes);

    let errorHtml = "";

    const res = await this.model.savePermissions(data);
    setButtonsStatus();

    if (!!cb) {
      cb(res);
    }

    if (res && res.error) {
      errorHtml = res.error.message;
      return D.a("Error", errorHtml);
    }

    if (res.success) {
      this.refreshGridData();

      if (res && res.failureRoutes && res.failureRoutes.length) {
        errorHtml += "<p>Below are the failure routes to save: </p><br/>";
        errorHtml += '<table border="1"><tr><th>Route</th><th>Reason</th></tr>';
        res.failureRoutes.forEach((r) => {
          errorHtml +=
            "<tr><td>" + r.method + "</td><td>" + r.reason + "</td></tr>";
        });
        errorHtml += "</table>";
        return D.a("Error", errorHtml);
      }

      errorHtml = "<p>Update Success</p><br/>";
      return D.a("Success", errorHtml);
    }

    return D.a("Error", "Something went wrong.");
  }
});
