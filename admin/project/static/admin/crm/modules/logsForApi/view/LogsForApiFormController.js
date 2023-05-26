Ext.define("Crm.modules.logsForApi.view.LogsForApiFormController", {
    extend: "Core.form.FormController",
  
    async setValues(data) {
        console.log(data);
        if (data.user_id.email){
            data.user_id = data.user_id.email;
        }
        this.callParent(arguments);
    },

  });