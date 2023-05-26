Ext.define("Crm.modules.systemVariables.view.SystemVariablesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("System Variables"),
  iconCls: "x-fa fa-cogs",
  filterbar: true,
  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Code"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "code"
      },
      {
        text: D.t("Value"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "value"
      },
      {
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        filter: this.buildRealmCombo(),
        dataIndex: "realm_id",
        renderer: function(v, r, e) {
          if (v && v.name) {
            v = v.name;
          } else {
            v = "RECORD WAS CREATED BY SYSTEM. PLEASE, SELECT REALM.";
          }
          return v;
        }
      },
      {
        text: D.t("Maker"),
        flex: 1,
        sortable: true,
        dataIndex: "maker",
        filter: this.buildMakerCombo(),
        renderer: function(v, r, e) {
          if (v && v.login) {
            v = v.login;
          } else {
            v = "RECORD WAS CREATED BY SYSTEM";
          }
          return v;
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

  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm_id"
    });
  },
  buildMakerCombo() {
    return Ext.create("Crm.modules.users.view.AdminsCombo", {
      name: "maker"
    });
  }
});
