Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountPermissionsGrid",
  {
    extend: "Core.grid.GridContainer",

    title: D.t("Permission to use the Aggregator for the Organization"),
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
        if (v && v.login) {
          return v.login;
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
          filter: this.buildAggregatorsCombo(),
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
          format: "d.m.Y H:i:s"
        }
      ];
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
    buildUserCombo() {
      return {
        xtype: "dependedcombo",
        dataModel: "Crm.modules.users.model.UsersModel",
        fieldSet: "_id,login",
        valueField: "_id",
        displayField: "login",
        editable: true,
        forceSelection: true
      };
    },
    buildAggregatorsCombo() {
      return {
        xtype: "dependedcombo",
        dataModel: "Crm.modules.aggregators.model.AggregatorsModel",
        fieldSet: "id,name",
        valueField: "id",
        displayField: "name",
        editable: true,
        forceSelection: true
      };
    }
  }
);
