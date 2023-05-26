Ext.define("Crm.modules.routes.view.RouteCombo", {
  extend: "Core.form.DependedCombo",

  // fieldLabel: D.t("Realm"),
  dataModel: "Crm.modules.routes.model.RoutesModel",
  fieldSet: "id,report_name",
  valueField: "id",
  displayField: "report_name",
  editable: true,
  name: "route_id",
  allowBlank: true,
  fieldLabel: D.t("Report Name"),
  editable: false
});
