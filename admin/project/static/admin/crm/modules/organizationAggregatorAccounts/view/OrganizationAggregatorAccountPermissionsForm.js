Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountPermissionsForm",
  {
    extend: "Core.form.FormWindow",
    controllerCls:
      "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountPermissionsFormController",
    titleTpl: D.t("Organization - Aggregators"),
    iconCls: "x-fa fa-cog",

    buildItems: function() {
      return [
        {
          name: "id",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("ID")
        },
        this.buildOrganizationCombo(),
        this.buildAggregatorsCombo(),
        {
          xtype: "xdatefield",
          name: "ctime",
          fieldLabel: D.t("Created time"),
          format: D.t("d.m.Y H:i:s O"),
          flex: 1,
          readOnly: true
        }
      ];
    },

    buildOrganizationCombo: function() {
      return Ext.create("Core.form.DependedCombo", {
        fieldLabel: D.t("Organization"),
        name: "organization_id",
        readonly: false,
        dataModel: Ext.create(
          "Crm.modules.organizations.model.OrganizationsModel"
        ),
        fieldSet: "id,organization_name",
        valueField: "id",
        displayField: "organization_name",
        editable: true,
        allowBlank: false
      });
    },
    buildAggregatorsCombo: function() {
      return Ext.create("Core.form.DependedCombo", {
        fieldLabel: D.t("Aggregator"),
        name: "aggregator_id",
        readonly: false,
        dataModel: Ext.create("Crm.modules.aggregators.model.AggregatorsModel"),
        fieldSet: "id,name",
        valueField: "id",
        displayField: "name",
        editable: true,
        allowBlank: false
      });
    }
  }
);
