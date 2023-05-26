Ext.define("Crm.modules.users.view.AdminsCombo", {
  extend: "Core.form.DependedCombo",

//   fieldLabel: D.t("Admin"),
  dataModel: "Crm.modules.users.model.UsersModel",
  fieldSet: "_id,login",
  valueField: "_id",
  displayField: "login",
  editable: false
});
