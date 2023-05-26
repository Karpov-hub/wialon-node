Ext.define("Crm.modules.requestToRegistration.view.RequestToRegistrationGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Requests to registration"),
  iconCls: "x-fa fa-question-circle",

  filterbar: true,
  filterable: true,

  requires: ["Core.grid.ComboColumn"],

  buildColumns: function() {
    const rendererForColor = (v, m, r) => {
      if (r.data.status === 0) {
        m.tdCls = "custom-expired-row";
      }
      return v;
    };
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name",
        renderer: rendererForColor
      },
      {
        text: D.t("Company"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "company",
        renderer: rendererForColor
      },
      {
        text: D.t("Realm"),
        flex: 1,
        filter: this.buildRealmCombo(),
        sortable: true,
        dataIndex: "realm_id",
        renderer: (v, m, r) => {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          if (v && v.name) {
            return v.name;
          } else {
            return "REALM IS NOT SETTED";
          }
        }
      },
      {
        text: D.t("Website"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "website",
        renderer: rendererForColor
      },
      {
        text: D.t("Does user have wialon accounts"),
        flex: 1,
        filter: this.buildAccountFilterCombo(),
        sortable: true,
        dataIndex: "is_wialon_accounts_exists",
        renderer: function(v, m, r) {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          if (v === true) {
            return "Yes";
          } else if (v === false) {
            return "No";
          } else {
            return v + " (unexpected value)";
          }
        }
      },
      {
        text: D.t("What tasks is user plan to solve with Repogen?"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wishes",
        renderer: rendererForColor
      },
      {
        text: D.t("Phone number"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "phone_number",
        renderer: rendererForColor
      },
      {
        text: D.t("Email"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "email",
        renderer: rendererForColor
      },
      {
        flex: 1,
        xtype: "datecolumn",
        format: "d.m.Y H:i",
        text: D.t("Created time"),
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" },
        renderer: rendererForColor
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        filter: this.buildStatusCombo(),
        dataIndex: "status",
        renderer: function(v, m, r) {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          if (v === 0) {
            return "Pending";
          } else if (v === 1) {
            return "Approved";
          } else if (v === 2) {
            return "Rejected";
          } else {
            return v + " (unexpected status)";
          }
        }
      }
    ];
  },
  buildTbar: function() {
    let items = [
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-refresh",
        action: "refresh"
      }
    ];

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },
  buildAccountFilterCombo: function() {
    return {
      xtype: "combo",
      name: "is_wialon_accounts_exists",
      valueField: "val",
      displayField: "name",
      queryMode: "local",
      forceSelection: true,
      editable: false,
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["val", "name"],
        data: [
          [true, D.t("Exists")],
          [false, D.t("Not exists")]
        ]
      })
    };
  },
  buildStatusCombo: function() {
    return {
      xtype: "combo",
      name: "status",
      valueField: "val",
      displayField: "name",
      queryMode: "local",
      forceSelection: true,
      editable: false,
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["val", "name"],
        data: [
          [0, D.t("Pending")],
          [1, D.t("Activaded")],
          [2, D.t("Rejected")]
        ]
      })
    };
  },
  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm_id"
    });
  }
});
