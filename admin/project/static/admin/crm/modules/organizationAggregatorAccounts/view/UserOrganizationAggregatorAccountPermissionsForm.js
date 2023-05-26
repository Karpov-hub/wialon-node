Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.UserOrganizationAggregatorAccountPermissionsForm",
  {
    extend: "Core.form.FormWindow",
    controllerCls:
      "Crm.modules.organizationAggregatorAccounts.view.UserOrganizationAggregatorAccountPermissionsFormController",
    titleTpl: D.t("Organization - Aggregators"),
    iconCls: "x-fa fa-cog",

    buildItems: function() {
      return [
        {
          name: "user_id",
          fieldLabel: D.t("User"),
          readOnly: true
        },
        {
          name: "organization_id",
          fieldLabel: D.t("Organization"),
          readOnly: true
        },
        {
          name: "aggregator_id",
          fieldLabel: D.t("Aggregator"),
          readOnly: true
        },
        {
          name: "maker",
          fieldLabel: D.t("Maker"),
          readOnly: true
        },
        {
          name: "ctime",
          fieldLabel: D.t("Created time"),
          format: D.t("d.m.Y H:i:s O"),
          readOnly: true
        }
      ];
    },
    buildButtons: function() {
      return [
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          action: "formclose",
          scale: "medium"
        }
      ];
    }
  }
);
