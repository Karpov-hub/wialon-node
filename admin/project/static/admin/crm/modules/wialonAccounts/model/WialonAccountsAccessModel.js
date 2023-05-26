/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 10 April 2020
 * @private
 */
Ext.define("Crm.modules.wialonAccounts.model.WialonAccountsAccessModel", {
  extend: "Core.data.DataModel",

  collection: '"wialon_account_accesses"',
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wialon_acc_id",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    }]

});
