Ext.define("Crm.modules.taxInformations.view.TaxInformationsGrid", {
  extend: "main.GridContainer",

  title: D.t("Tax Informations"),
  iconCls: "fa fa-info-circle",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: false,
  autoscroll: true,

  buildColumns: function() {
    return [
      {
        text: D.t("From Date"),
        xtype: "datecolumn",
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: D.t("d/m/Y"),
          submitFormat: "Y/m/d"
        },
        dataIndex: "from_date",
        renderer: function(v, m, r) {
          return Ext.Date.format(new Date(v), "d.m.Y");
        }
      },
      {
        text: D.t("To Date"),
        xtype: "datecolumn",
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: D.t("d/m/Y"),
          submitFormat: "Y/m/d"
        },
        dataIndex: "to_date",
        renderer: function(v, m, r) {
          return Ext.Date.format(new Date(v), "d.m.Y");
        }
      },
      {
        text: D.t("Tax Percentage"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "percentage"
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" }
      }
    ];
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: this.buttonEditTooltip,
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildFormItems: function(request) {
    return [
      {
        xtype: "datefield",
        format: D.t("d/m/Y"),
        fieldLabel: D.t("From Date*"),
        submitFormat: "Y/m/d",
        name: "from_date",
        value: request && request.from_date ? new Date(request.from_date) : "",
        allowBlank: false
      },
      {
        xtype: "datefield",
        format: D.t("d/m/Y"),
        fieldLabel: D.t("To Date*"),
        submitFormat: "Y/m/d",
        name: "to_date",
        value: request && request.to_date ? new Date(request.to_date) : "",
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        name: "percentage",
        fieldLabel: D.t("Tax Percentage*"),
        value: request && request.percentage ? request.percentage : 0,
        allowBlank: false
      },
      {
        xtype: "xdatefield",
        name: "ctime",
        fieldLabel: D.t("Created time"),
        readOnly: true,
        format: D.t("d.m.Y H:i:s O"),
        value: request && request.ctime ? request.ctime : null,
        flex: 1
      }
    ];
  }
});
