Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountPermissionsFormController",
  {
    extend: "Core.form.FormController",

    async setValues(data) {
      if (data) {
        if (data.organization_id) {
          data.organization_id = data.organization_id.organization_name;
        }
        if (data.aggregator_id) {
          data.aggregator_id = data.aggregator_id.id;
        }
        if (data.maker && data.maker.email) {
          data.maker = data.maker.email;
        }
      }
      this.callParent(arguments);
    }
  }
);
