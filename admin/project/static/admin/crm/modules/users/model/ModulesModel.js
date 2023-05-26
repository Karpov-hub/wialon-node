/**
 * @author Diwakar Maurya
 * @scope Server, Client
 * The model for Users Groups module
 * @private
 */
Ext.define("Crm.modules.users.model.ModulesModel", {
  extend: "Core.data.DataModel",

  collection: "CrmModules",

  fields: [
    {
      name: "_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "category",
      type: "string",
      enum: ["API_ACCESS", "MODEL_ACCESS", "PAGE_ACCESS"],
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  validations: [
    { type: "Presence", field: "name" },
    { type: "Presence", field: "category" }
  ]
});
