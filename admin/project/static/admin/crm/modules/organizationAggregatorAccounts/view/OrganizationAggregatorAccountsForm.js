Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountsForm",
  {
    extend: "Core.form.FormWindow",
    controllerCls:
      "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountsFormController",

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
        {
          name: "organization_id",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Organization")
        },
        {
          name: "aggregator_id",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Aggregator")
        },
        {
          name: "name",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Name")
        },
        {
          name: "api_key",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Api-key")
        },
        {
          name: "password",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Password")
        },
        {
          name: "login",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Login")
        },
        {
          name: "contract_number",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Contract number")
        },
        {
          name: "maker",
          xtype: "textfield",
          readOnly: true,
          fieldLabel: D.t("Maker")
        },
        {
          //   name: "status",
          //   xtype: "textfield",
          //   readOnly: true,
          //   fieldLabel: D.t("Status"),
          // }, {
          name: "ctime",
          xtype: "xdatefield",
          readOnly: true,
          fieldLabel: D.t("Create date"),
          format: "d.m.Y H:i:s O"
        }
      ];
    },

    buildButtons: function() {
      var btns = [
        "->",
        // {
        //   text: D.t("Approve"),
        //   iconCls: "x-fa fa-check",
        //   action: "approve",
        // },
        // {
        //   text: D.t("Reject"),
        //   iconCls: "x-fa fa-times",
        //   action: "reject",
        // },
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          action: "formclose"
        }
      ];
      return btns;
    }
  }
);
