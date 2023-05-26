Ext.define("Crm.modules.organizationAggregatorAccounts.view.UserOrganizationAggregatorAccountPermissionsFormController", {
  extend: "Core.form.FormController",

  setValues(data) {
    if (data.user_id) {
      data.user_id = data.user_id.email;
    }
    if (data.maker && data.maker.email) {
      data.maker = data.maker.email;
    }
    if (data.organization_id) {
      data.organization_id = data.organization_id.organization_name;
    }
    if (data.aggregator_id) {
      data.aggregator_id = data.aggregator_id.name;
    }
    this.callParent(arguments);
  },
});
  