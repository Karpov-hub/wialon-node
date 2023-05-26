/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 17 April 2020
 * @private
 */
Ext.define("Crm.modules.ratesPackages.model.PackageSubscriptionModel", {
  extend: "Core.data.DataModel",

  collection: '"package_subscriptions"',
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "organization_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "rates_package_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "from_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "to_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ]

});
