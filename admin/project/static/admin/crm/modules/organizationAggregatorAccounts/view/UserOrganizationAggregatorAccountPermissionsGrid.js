Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.UserOrganizationAggregatorAccountPermissionsGrid",
  {
    extend: "Core.grid.GridContainer",

    title: D.t("Permission to use organization aggregator account for user"),
    iconCls: "fa fa-cog",

    filterbar: true,
    filterable: true,

    requires: ["Core.form.DependedCombo"],

    buildColumns: function() {
      const renderer = function(v, m, r) {
        if (v && v.name) {
          return v.name;
        }
        if (v && v.organization_name) {
          return v.organization_name;
        }
        if (v && v.email) {
          return v.email;
        }
        if (!v) {
          return "Missing";
        }
        return v;
      };
      return [
        {
          text: D.t("ID"),
          flex: 1,
          sortable: true,
          dataIndex: "id",
          filter: true
        },
        {
          text: D.t("User"),
          flex: 1,
          dataIndex: "user_id",
          filter: this.buildUserCombo(),
          sortable: true,
          renderer
        },
        {
          text: D.t("Organization"),
          flex: 1,
          sortable: true,
          dataIndex: "organization_id",
          filter: this.buildOrganizationCombo(),
          renderer
        },
        {
          text: D.t("Aggregator"),
          flex: 1,
          sortable: true,
          dataIndex: "aggregator_id",
          filter: this.buildAggregatorCombo(),
          renderer
        },
        {
          text: D.t("Maker"),
          flex: 1,
          dataIndex: "maker",
          filter: this.buildUserCombo(),
          sortable: true,
          renderer
        },
        {
          text: D.t("Create date"),
          flex: 1,
          filter: { xtype: "datefield", format: "d.m.Y" },
          sortable: true,
          dataIndex: "ctime",
          xtype: "datecolumn",
          format: "d.m.Y H:i:s O"
        },
        {
          text: D.t("Update date"),
          flex: 1,
          filter: { xtype: "datefield", format: "d.m.Y" },
          sortable: true,
          dataIndex: "mtime",
          xtype: "datecolumn",
          format: "d.m.Y H:i:s O"
        }
      ];
    },
    buildUserCombo() {
      return {
        xtype: "dependedcombo",
        dataModel: "Crm.modules.accountHolders.model.UsersModel",
        fieldSet: "id,email",
        valueField: "id",
        displayField: "email",
        editable: true,
        forceSelection: true
      };
    },
    buildAggregatorCombo() {
      return {
        xtype: "dependedcombo",
        dataModel: "Crm.modules.aggregators.model.AggregatorsModel",
        fieldSet: "id,name",
        valueField: "id",
        displayField: "name",
        editable: true,
        forceSelection: true
      };
    },
    buildOrganizationCombo() {
      return {
        xtype: "dependedcombo",
        dataModel: "Crm.modules.organizations.model.OrganizationsModel",
        fieldSet: "id,organization_name",
        valueField: "id",
        displayField: "organization_name",
        editable: true,
        forceSelection: true
      };
    },
    buildTbar() {
      let items = [];

      items.push({
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-refresh",
        action: "refresh"
      });

      return items;
    }
  }
);
