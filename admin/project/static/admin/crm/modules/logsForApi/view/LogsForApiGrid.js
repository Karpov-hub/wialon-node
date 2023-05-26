Ext.define("Crm.modules.logsForApi.view.LogsForApiGrid", {
  extend: "main.GridContainer",

  title: D.t("Logs for api"),
  iconCls: "x-fa fa-key",

  filterbar: true,
  filterable: true,
  controllerCls: "Crm.modules.logsForApi.view.LogsForApiGridController",

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
        dataIndex: "action",
        text: D.t("Action type"),
        flex: 1,
        filter: this.buildActionCombo()
      },
      {
        text: D.t("User"),
        flex: 1,
        sortable: true,
        dataIndex: "user_id",
        filter: this.buildUserCombo(),
        renderer: function(v, m, r) {
          if (v && v.login && v.email) {
            return `${v.login} (${v.email})`;
          } else if (v && v.login) {
            return v.login;
          }
          return v;
        }
      },
      {
        text: D.t("Message"),
        flex: 1,
        sortable: true,
        dataIndex: "message"
      },
      {
        text: D.t("Data"),
        flex: 1,
        sortable: true,
        dataIndex: "data"
      },
      {
        text: D.t("Date creation"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "ctime",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O"
      },
      {
        text: D.t("Date update"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "mtime",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O"
      }
    ];
  },

  buildTbar() {
    let items = [];
    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-refresh",
      action: "refresh"
    });
    items.push("-", {
      text: this.buttonExportText,
      iconCls: "x-fa fa-cloud-upload",
      action: "download-report"
    });
    return items;
  },

  buildButtonsColumns() {
    return [];
  },

  buildUserCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,login",
      valueField: "id",
      displayField: "login",
      editable: false
    };
  },

  buildActionCombo() {
    return {
      xtype: "combo",
      valueField: "key",
      displayField: "val",
      store: {
        fields: ["key", "val"],
        data: [
          { key: "LOGIN", val: D.t("Login") },
          { key: "LOGOUT", val: D.t("Logout") },
          { key: "CREATE_REPORT", val: D.t("Create report") },
          { key: "CREATED_REPORT", val: D.t("Report created") },
          { key: "ERROR_CREATE_REPORT", val: D.t("Create report error") },
          { key: "CRON", val: D.t("Daily uploads transaction") }
        ]
      }
    };
  }
});
