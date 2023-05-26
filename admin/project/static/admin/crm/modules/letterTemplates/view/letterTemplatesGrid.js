Ext.define("Crm.modules.letterTemplates.view.letterTemplatesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Letter Templates"),
  iconCls: "x-fa fa-envelope-o",

  filterable: true,
  filterbar: true,

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
        text: D.t("Language"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "lang"
      },
      {
        text: D.t("Letter name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "letter_name"
      },
      {
        text: D.t("Subject"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "subject"
      },

      {
        text: D.t("Transporter"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "transporter"
      },
      {
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        filter: Ext.create("Crm.modules.realm.view.RealmCombo", {
          name: null,
          fieldLabel: null
        }),
        dataIndex: "realm",
        renderer: (v, m, r) => {
          return v ? v.name : "";
        }
      },
      {
        text: D.t("Maker"),
        flex: 1,
        sortable: true,
        dataIndex: "maker",
        renderer: function(v, r, e) {
          if (v && v.login) {
            v = v.login;
          } else {
            v = "MAKER IS NOT SETTED";
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
  }
});
