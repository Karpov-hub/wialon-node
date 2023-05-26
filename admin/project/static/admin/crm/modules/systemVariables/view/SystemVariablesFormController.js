Ext.define("Crm.modules.systemVariables.view.SystemVariablesFormController", {
  extend: "Core.form.FormController",

  setValues(data) {
    const defalutValue = "RECORD WAS CREATED BY SYSTEM.";
    if (data) {
      if (data.maker && data.maker.login) {
        data.maker = data.maker.login;
      } else {
        data.maker = defalutValue;
      }
      if (data.realm_id && data.realm_id.id) {
        data.realm_id = data.realm_id.id;
      } else {
        data.realm_id = defalutValue + " PLEASE, SELECT REALM.";
      }
    }
    this.callParent(arguments);
  }
});
