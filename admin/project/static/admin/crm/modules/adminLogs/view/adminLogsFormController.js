Ext.define("Crm.modules.adminLogs.view.adminLogsFormController", {
  extend: "Core.form.FormController",

  setValues: function(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    let formData = {
      id: data.id,
      date: data.date,
      data: JSON.stringify(JSON.parse(data.data), null, 4) || "",
      result: JSON.stringify(JSON.parse(data.result), null, 4) || ""
    };
    this.view.currentData = formData;
    var form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, formData);
    form.getForm().setValues(formData);
    this.view.fireEvent("setvalues", form, formData);
  }
});
