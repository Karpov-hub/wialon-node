Ext.define("Crm.modules.certainPermissions.view.CertainPermissionsGrid", {
  extend: "Core.grid.GridContainer",
  title: D.t("Certain Permissions To Report"),
  iconCls: "x-fa fa-list",
  filterable: true,
  filterbar: true,

  fields: [
    "id",
    "user_id",
    "route_id",
    "allow_user",
    "type_restriction",
    "ctime",
    "maker"
  ],

  requires: ["Core.form.DependedCombo"],

  buildColumns: function() {
    let me = this;
    return [
      {
        text: D.t("Id"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "id",
        hidden: true
      },
      {
        text: D.t("User"),
        flex: 1,
        sortable: true,
        filter: this.buildUsersCombo(),
        dataIndex: "user_id",
        renderer: function(v, m, r) {
          if (v && v.email) {
            v = v.email;
          }
          return v;
        }
      },
      {
        text: D.t("Report"),
        flex: 1,
        sortable: true,
        filter: this.buildReportRoute(),
        dataIndex: "route_id",
        renderer: function(v, m, r) {
          if (v && v.report_name) {
            v = v.report_name;
          }
          return v;
        }
      },
      {
        text: D.t("Allowed to User"),
        flex: 1,
        sortable: true,
        filter: this.buildAllowCombo(),
        dataIndex: "allow_user",
        renderer: function(v, m, r) {
          if (v) {
            v = "Allowed";
          } else if (!v) {
            v = "Not allowed";
          } else {
            v = "Wrong value. Contact to Dev Group.";
          }
          return v;
        }
      },
      {
        text: D.t("Type of Restriction"),
        flex: 1,
        sortable: true,
        dataIndex: "type_restriction",
        filter: this.buildResctrictionTypeCombo()
      },
      {
        text: D.t("Maker"),
        flex: 1,
        sortable: true,
        filter: false,
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
  },

  buildUsersCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,email",
      valueField: "id",
      displayField: "email",
      name: "user_id",
      forceSelection: true
    };
  },

  buildReportRoute() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.routes.model.RoutesModel",
      fieldSet: "id,report_name",
      valueField: "id",
      displayField: "report_name",
      name: "route_id",
      forceSelection: true
    };
  },

  buildAllowCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "allow_user",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["allow_user", "text"],
        data: [
          [true, D.t("Allowed")],
          [false, D.t("Not Allowed")]
        ]
      }),
      name: "allow_user"
    };
  },

  buildResctrictionTypeCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "type_restriction",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["type_restriction", "text"],
        data: [
          ["CREATE", D.t("CREATE")],
          ["DOWNLOAD", D.t("DOWNLOAD")]
        ]
      }),
      name: "type_restriction"
    };
  }
});
