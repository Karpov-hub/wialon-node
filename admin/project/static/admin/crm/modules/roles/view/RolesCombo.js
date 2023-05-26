Ext.define("Crm.modules.roles.view.RolesCombo", {
    extend: "Core.form.DependedCombo",
  
    // fieldLabel: D.t("Role"),
    dataModel: "Crm.modules.roles.model.RolesModel",
    fieldSet: "id,role",
    valueField: "id",
    displayField: "role",
    editable: false
  });
  