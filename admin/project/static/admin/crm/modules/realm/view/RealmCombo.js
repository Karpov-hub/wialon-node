Ext.define("Crm.modules.realm.view.RealmCombo", {
  extend: "Core.form.DependedCombo",

  // fieldLabel: D.t("Realm"),
  dataModel: "Crm.modules.realm.model.RealmModel",
  fieldSet: "id,name",
  valueField: "id",
  displayField: "name",
  editable: false
});
