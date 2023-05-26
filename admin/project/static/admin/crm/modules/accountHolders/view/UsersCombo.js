Ext.define("Crm.modules.accountHolders.view.UsersCombo", {
    extend: "Core.form.DependedCombo",
  
    fieldLabel: D.t("User"),
    dataModel: "Crm.modules.accountHolders.model.UsersModel",
    fieldSet: "id,name",
    valueField: "id",
    displayField: "name",
    editable: false
  });
  