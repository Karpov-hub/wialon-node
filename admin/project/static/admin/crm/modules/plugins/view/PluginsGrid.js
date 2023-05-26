Ext.define("Crm.modules.plugins.view.PluginsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Plugins"),
  iconCls: "fa fa-puzzle-piece",

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
        dataIndex: "name",
        text: D.t("Plugin name"),
        flex: 1,
        filter: true
      },
      {
        text: D.t("Maker"),
        flex: 1,
        sortable: true,
        filter: this.buildUserCombo(),
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
  }
});
