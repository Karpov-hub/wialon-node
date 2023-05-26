Ext.define("Crm.modules.ratesPackages.view.RatesPackagesGrid", {
  extend: "main.GridContainer",

  title: D.t("Packages"),
  iconCls: "fa fa-info-circle",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: false,
  autoscroll: true,

  buildColumns: function() {
    var me = this;
    return [
      {
        text: D.t("Package name"),
        // width:'20%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "package_name"
      },
      {
        text: D.t("Fixed monthly fees"),
        // width:'20%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "fixed_monthly_fees"
      },
      {
        text: D.t("CPU time taken rate"),
        // width:'25%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "cpu_time_taken"
      },
      {
        text: D.t("Bytes downloaded rate"),
        // width:'25%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "bytes_sent"
      },
      {
        text: D.t("Bytes received from wialon rate"),
        // width:'30%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "bytes_from_wialon"
      },
      {
        text: D.t("Number of employees rate"),
        // width:'30%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "no_of_employees"
      },
      {
        text: D.t("Number of wialon accounts rate"),
        flex: 1,
        // width:'30%',
        sortable: true,
        filter: true,
        dataIndex: "no_of_wialon_acc"
      },
      {
        text: D.t("Downloads click rate"),
        // width:'30%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "downloads_click"
      },
      {
        text: D.t("Generate reports click rate"),
        // width:'30%',
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "generate_reports_click"
      },
      {
        text: D.t("Is Offering Package"),
        // width:'20%',
        flex: 1,
        sortable: true,
        dataIndex: "is_offering_pkg",
        filter: me.buildActiveCombo(true),
        renderer: function(v) {
          return v ? "Yes" : "No";
        }
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
    var me = this;
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
          },
          {
            iconCls: "x-fa fa-trash",
            tooltip: this.buttonDeleteTooltip,
            isDisabled: function() {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildActiveCombo: function(allowBlank, fieldLabel, value) {
    return {
      xtype: "combo",
      fieldLabel: fieldLabel ? fieldLabel : "",
      name: "is_offering_pkg",
      editable: false,
      labelWidth: 130,
      minValue: 0,
      valueField: "code",
      displayField: "status",
      queryMode: "local",
      value: value != undefined ? value : "",
      allowBlank: allowBlank,
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["code", "status"],
        data: [
          [false, D.t("No")],
          [true, D.t("Yes")]
        ]
      })
    };
  },

  buildFormItems: function(request) {
    var me = this;
    return [
      {
        name: "package_name",
        fieldLabel: D.t("Package name*"),
        labelWidth: 130,
        value: request && request.package_name ? request.package_name : "",
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        name: "fixed_monthly_fees",
        fieldLabel: D.t("Fixed monthly fees*"),
        labelWidth: 130,
        value:
          request && request.fixed_monthly_fees
            ? request.fixed_monthly_fees
            : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        name: "fixed_monthly_fees_fuc",
        fieldLabel: D.t("Fixed monthly fees FUC*"),
        labelWidth: 130,
        value:
          request && request.fixed_monthly_fees_fuc
            ? request.fixed_monthly_fees_fuc
            : 0,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "cpu_time_taken",
        decimalPrecision: 10,
        fieldLabel: D.t("CPU time taken rate*"),
        value: request && request.cpu_time_taken ? request.cpu_time_taken : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "bytes_sent",
        decimalPrecision: 10,
        fieldLabel: D.t("Bytes downloaded rate*"),
        value: request && request.bytes_sent ? request.bytes_sent : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "bytes_from_wialon",
        decimalPrecision: 10,
        fieldLabel: D.t("Bytes received from wialon rate*"),
        value:
          request && request.bytes_from_wialon ? request.bytes_from_wialon : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "downloads_click",
        decimalPrecision: 6,
        fieldLabel: D.t("Downloads click rate*"),
        value: request && request.downloads_click ? request.downloads_click : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "generate_reports_click",
        decimalPrecision: 6,
        fieldLabel: D.t("Generate reports click rate*"),
        value:
          request && request.generate_reports_click
            ? request.generate_reports_click
            : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "no_of_employees",
        decimalPrecision: 6,
        fieldLabel: D.t("Number of employees rate*"),
        value: request && request.no_of_employees ? request.no_of_employees : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      {
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 130,
        name: "no_of_wialon_acc",
        decimalPrecision: 6,
        fieldLabel: D.t("Number of wialon accounts rate*"),
        value:
          request && request.no_of_wialon_acc ? request.no_of_wialon_acc : 0,
        // readOnly:(request && request.id)?true:false,
        allowBlank: false
      },
      me.buildActiveCombo(
        false,
        D.t("Is Offering Package*"),
        request && request.is_offering_pkg ? request.is_offering_pkg : false
      ),
      {
        xtype: "xdatefield",
        labelWidth: 130,
        name: "ctime",
        fieldLabel: D.t("Created time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        value: request && request.ctime ? request.ctime : null,
        readOnly: true
      }
    ];
  }
});
