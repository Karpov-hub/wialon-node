Ext.define("Crm.modules.cards.view.CardsFormController", {
  extend: "Core.form.FormController",

  setValues(data) {
    if (data) {
      console.log(data);
      if (data.maker && data.maker.name && data.maker.email)
        data.maker = `${data.maker.name} (${data.maker.email})`;
      if (data.organization_id && data.organization_id.organization_name)
        data.organization_id = `${data.organization_id.organization_name} (${data.organization_id.id})`;
      if (
        data.organization_aggregator_account_id &&
        data.organization_aggregator_account_id.name
      )
        data.organization_aggregator_account_id =
          data.organization_aggregator_account_id.name;
    }

    this.callParent(arguments);
  }
});
