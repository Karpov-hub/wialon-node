Ext.define(
  "Crm.modules.organizationAggregatorAccounts.view.OrganizationAggregatorAccountsGrid",
  {
    extend: "Core.grid.GridContainer",

    title: D.t("API-KEY binding (Login - Password)"),
    iconCls: "fa fa-cog",

    filterbar: true,
    filterable: true,

    requires: ["Core.form.DependedCombo"],

    buildColumns: function() {
      const renderer = function(v, m, r) {
        if (!v) {
          return "Missing";
        }
        if (v && v.name) {
          return v.name;
        }
        if (v && v.organization_name) {
          return v.organization_name;
        }
        if (v && v.email) {
          return v.email || "Email not entered";
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
          text: D.t("Name"),
          flex: 1,
          sortable: true,
          dataIndex: "name",
          filter: true
        },
        // {
        //   text: D.t("Status"),
        //   flex: 1,
        //   sortable: true,
        //   filter: {
        //     xtype: "combo",
        //     valueField: "code",
        //     displayField: "name",
        //     editable: false,
        //     store: {
        //       fields: ["code", "name"],
        //       data: [
        //         { code: 1, name: D.t("Not approved") },
        //         { code: 2, name: D.t("In progress") },
        //         { code: 3, name: D.t("Approved") }
        //       ]
        //     }
        //   },
        //   dataIndex: "status",
        //   renderer: v => {
        //     switch (v) {
        //       case 1:
        //         return D.t("Not approved");
        //       case 2:
        //         return D.t("In progress");
        //       case 3:
        //         return D.t("Approved");
        //     }
        //   }
        // },
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
    buildTbar: function() {
      let items = [];

      items.push({
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-refresh",
        action: "refresh"
      });

      return items;
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
        dataModel: "Crm.modules.accountHolders.model.UsersModel",
        fieldSet: "id,email",
        valueField: "id",
        displayField: "email",
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
