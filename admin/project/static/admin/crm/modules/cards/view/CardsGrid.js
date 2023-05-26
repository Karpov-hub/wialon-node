Ext.define("Crm.modules.cards.view.CardsGrid", {
  extend: "Core.grid.GridContainer",
  title: D.t("Fuel Cards"),
  iconCls: "x-fa fa-credit-card",

  filterbar: true,
  filterable: true,

  requires: ["Core.form.DependedCombo"],

  buildColumns: function() {
    return [
      {
        text: D.t("ID"),
        flex: 1,
        sortable: true,
        dataIndex: "id",
        filter: true
      },
      {
        dataIndex: "card_number",
        text: D.t("Card number"),
        flex: 1,
        filter: true
      },
      {
        text: D.t("Organization"),
        flex: 1,
        sortable: true,
        dataIndex: "organization_id",
        filter: this.buildOrganizationCombo(),
        renderer: function(v, m, r) {
          if (v && v.organization_name) {
            return v.organization_name;
          }
          return v;
        }
      },
      {
        text: D.t("Account of Aggregator"),
        flex: 1,
        sortable: true,
        dataIndex: "organization_aggregator_account_id",
        filter: this.buildOrganizationAggregatorAccount(),
        renderer: (v, m, r) => {
          if (v && v.name) {
            return v.name;
          }
          return v;
        }
      },
      {
        text: D.t("Maker"),
        flex: 1,
        filter: this.buildUserCombo(),
        sortable: true,
        dataIndex: "maker",
        renderer: function(v, m, r) {
          console.log(v);
          if (v && v.name) {
            return (
              v.name + `(` + (v.email ? v.email : "MAKER IS NOT SET") + `)`
            );
          }
          return v;
        }
      },
      {
        text: D.t("Creating Time"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "ctime",
        xtype: "datecolumn",
        format: D.t("d.m.Y H:i:s O")
      },
      {
        text: D.t("Updating Time"),
        flex: 1,
        filter: {
          type: "date"
        },
        sortable: true,
        dataIndex: "mtime",
        xtype: "datecolumn",
        format: D.t("d.m.Y H:i:s O")
      }
    ];
  },

  buildTbar() {
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
      fieldSet: "id,email,name",
      valueField: "id",
      displayField: "name",
      editable: false
    };
  },

  buildOrganizationAggregatorAccount() {
    return {
      xtype: "dependedcombo",
      dataModel:
        "Crm.modules.organizationAggregatorAccounts.model.OrganizationAggregatorAccountsModel",
      fieldSet: "id,name",
      valueField: "id",
      displayField: "name",
      editable: false
    };
  }
});
