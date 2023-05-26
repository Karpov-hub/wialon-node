Ext.define("Crm.modules.aggregators.view.AggregatorsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Aggregators"),
  iconCls: "fa fa-university",

  filterbar: true,
  filterable: true,

  requires: ["Core.form.DependedCombo"],

  buildColumns: function() {
    const renderForBoolean = function(v, m, r) {
      if (v) {
        return "Required";
      } else {
        return "Not required";
      }
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
        dataIndex: "name",
        text: D.t("Aggregator name"),
        flex: 1,
        filter: true
      },
      {
        dataIndex: "name_for_custom_field",
        text: D.t("Property name in custom aggregator fields"),
        flex: 1,
        filter: true
      },
      {
        dataIndex: "api_key_required",
        text: D.t("API-key required"),
        flex: 1,
        filter: this.buildTrueFalseCombo(),
        renderer: renderForBoolean
      },
      {
        dataIndex: "log_pas_required",
        text: D.t("login - password required"),
        flex: 1,
        filter: this.buildTrueFalseCombo(),
        renderer: renderForBoolean
      },
      {
        dataIndex: "contract_number_required",
        text: D.t("Contract number required"),
        flex: 1,
        filter: this.buildTrueFalseCombo(),
        renderer: renderForBoolean
      },
      {
        dataIndex: "host",
        text: D.t("Aggregator API Domain"),
        flex: 1,
        filter: true
      },
      {
        dataIndex: "method_for_check",
        text: D.t("Method for check"),
        flex: 1,
        filter: true
      },
      {
        dataIndex: "method_for_get_data",
        text: D.t("Method for receiving transactions"),
        flex: 1,
        filter: true
      },
      {
        dataIndex: "service_for_method",
        text: D.t("Service"),
        flex: 1,
        filter: true
      },
      {
        text: D.t("Maker"),
        flex: 1,
        filter: this.buildUserCombo(),
        sortable: true,
        dataIndex: "maker",
        renderer: function(v, m, r) {
          if (v && v.login) {
            return v.login;
          } else {
            return v;
          }
        }
      },
      {
        text: D.t("Creation date"),
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

  // buildTbar(){
  //     let items = [];

  //     items.push({
  //         tooltip: this.buttonReloadText,
  //         iconCls: "x-fa fa-refresh",
  //         action: "refresh"
  //     });

  //     return items;
  // },

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

  buildTrueFalseCombo() {
    return {
      xtype: "combo",
      valueField: "key",
      displayField: "val",
      editable: false,
      store: {
        fields: ["key", "val"],
        data: [
          { key: true, val: D.t("Required") },
          { key: false, val: D.t("Not required") }
        ]
      }
    };
  }
});
