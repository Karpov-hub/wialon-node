Ext.define("Crm.modules.organizations.view.OrganizationsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Organizations"),
  iconCls: "x-fa fa-users",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: false,

  buildColumns: function() {
    const changeColorToRedAccordingSandboxStatus = (m, r) => {
      if (r.data.sandbox_access_status === 2) {
        m.tdCls = "custom-expired-row";
      }
    };

    const returnForBoolean = (v) => {
      if (v === true) {
        return "Enabled";
      } else if (v === false) {
        return "Disabled";
      }
    };

    const returnForSandboxAccess = (v) => {
      switch (v) {
        case 1:
          return "Not requested";
        case 2:
          return "Requested";
        case 3:
          return "Approved";
        case 4:
          return "Rejected";
        case 5:
          return "Deactivated";
      }
    };

    const rendererForColor = (v, m, r) => {
      changeColorToRedAccordingSandboxStatus(m, r);
      return v;
    };

    const rendererForColorAndBoolean = (v, m, r) => {
      changeColorToRedAccordingSandboxStatus(m, r);
      return returnForBoolean(v);
    };

    const rendererForSandboxAccess = (v, m, r) => {
      changeColorToRedAccordingSandboxStatus(m, r);
      return returnForSandboxAccess(v);
    };

    return [
      {
        dataIndex: "sandbox_access_status",
        hidden: true
      },
      {
        text: D.t("Organization Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "organization_name",
        renderer: rendererForColor
      },
      {
        text: D.t("Invoice tab enabled"),
        flex: 1,
        sortable: true,
        filter: this.buildBooleanCombo(),
        dataIndex: "is_billing_enabled",
        renderer: rendererForColorAndBoolean
      },
      {
        text: D.t("Billing day"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "billing_day",
        renderer: rendererForColor
      },
      {
        text: D.t("Sandbox access status"),
        flex: 1,
        sortable: true,
        filter: this.buildBooleanCombo(),
        dataIndex: "sandbox_access_status",
        renderer: rendererForSandboxAccess
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: D.t("d.m.Y H:i:s O"),
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" },
        renderer: rendererForColor
      }
    ];
  },

  buildBooleanCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "value",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["value", "text"],
        data: [
          [true, D.t("Enabled")],
          [false, D.t("Disabled")]
        ]
      })
    };
  }

  // ,buildButtonsColumns: function() {
  //   var me = this;
  //   return [
  //     {
  //       xtype: "actioncolumn",
  //       width: 54,
  //       menuDisabled: true,
  //       items: [
  //         {
  //           iconCls: "x-fa fa-pencil-square-o",
  //           tooltip: this.buttonEditTooltip,
  //           isDisabled: function() {
  //             return !me.permis.modify && !me.permis.read;
  //           },
  //           handler: function(grid, rowIndex) {
  //             me.fireEvent("edit", grid, rowIndex);
  //           }
  //         }
  //       ]
  //     }
  //   ];
  // }

  // , buildTbar: function () {
  //   var me = this, items = [];
  //   items.push('-', {
  //     tooltip: D.t('Reload data'),
  //     iconCls: 'x-fa fa-refresh',
  //     action: 'refresh'
  //   });
  //   if (this.filterable)
  //     items.push('->', this.buildSearchField());

  //   return items;
  // }
});
