Ext.define("Crm.modules.plugins.view.OrganizationPluginsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Organization plugins"),
  iconCls: "fa fa-puzzle-piece",

  filterbar: true,
  filterable: true,

  requires: ["Core.form.DependedCombo"],

  buildColumns: function() {
    const rendererForColor = (v, m, r) => {
      if (r.data.status === 1) {
        m.tdCls = "custom-expired-row";
      }
      return v;
    };
    const renderer = function(v, m, r) {
      if (r.data.status === 1) {
        m.tdCls = "custom-expired-row";
      }
      if (!v) {
        return "Missing";
      }
      if (v && v.organization_name) {
        return v.organization_name;
      }
      if (v && v.name) {
        return v.name;
      }
      if (v && v.email) {
        return v.email || "Email not entered";
      }
      return v;
    };

    const rendererForDate = function(v, m, r) {
      if (r.data.status === 1) {
        m.tdCls = "custom-expired-row";
      }
      if (!v) {
        return "Not deactivated";
      }
      return Ext.Date.format(new Date(v), "d.m.Y H:i:s O");
    };
    return [
      {
        text: D.t("ID"),
        flex: 1,
        sortable: true,
        dataIndex: "id",
        filter: true,
        renderer: rendererForColor
      },
      {
        text: D.t("Organization"),
        flex: 1,
        sortable: true,
        dataIndex: "organization_id",
        filter: this.buildOrganizationCombo(),
        renderer
      },
      {
        text: D.t("Plugin"),
        flex: 1,
        sortable: true,
        dataIndex: "plugin_id",
        filter: this.buildPluginsCombo(),
        renderer
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          editable: false,
          store: {
            fields: ["code", "name"],
            data: [
              { code: 0, name: D.t("Not requested") },
              { code: 1, name: D.t("In progress") },
              { code: 2, name: D.t("Approved") },
              { code: 3, name: D.t("Rejected") },
              { code: 4, name: D.t("Deactivated") }
            ]
          }
        },
        dataIndex: "status",
        renderer: (v, m, r) => {
          if (r.data.status === 1) {
            m.tdCls = "custom-expired-row";
          }
          switch (v) {
            case 0:
              return D.t("Not requested");
            case 1:
              return D.t("In progress");
            case 2:
              return D.t("Approved");
            case 3:
              return D.t("Rejected");
            case 4:
              return D.t("Deactivated");
          }
        }
      },
      {
        text: D.t("Reject reason"),
        flex: 1,
        sortable: true,
        dataIndex: "reject_reason",
        filter: true,
        renderer: (v, m, r) => {
          if (r.data.status === 1) {
            m.tdCls = "custom-expired-row";
          }
          if (r.status != 3 && !v) {
            return "Not rejected";
          }
          return v;
        }
      },
      {
        text: D.t("Plugin fees"),
        flex: 1,
        sortable: true,
        dataIndex: "plugin_fees",
        filter: true,
        renderer: rendererForColor
      },
      {
        text: D.t("Maker"),
        flex: 1,
        dataIndex: "maker",
        filter: this.buildUserCombo(),
        sortable: true,
        renderer
      },
      {
        text: D.t("Last activated date"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "last_activated_date",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s",
        renderer: rendererForDate
      },
      {
        text: D.t("Last deactivated date"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "last_deactivated_date",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s",
        renderer: rendererForDate
      },
      {
        text: D.t("Create date"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "ctime",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        renderer: rendererForDate
      },
      {
        text: D.t("Update date"),
        flex: 1,
        filter: { xtype: "datefield", format: "d.m.Y" },
        sortable: true,
        dataIndex: "mtime",
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        renderer: rendererForDate
      }
    ];
  },
  buildUserCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,email",
      valueField: "id",
      displayField: "email",
      editable: true,
      forceSelection: true
    };
  },
  buildOrganizationCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.organizations.model.OrganizationsModel",
      fieldSet: "id,organization_name",
      valueField: "id",
      displayField: "organization_name",
      editable: true,
      forceSelection: true
    };
  },
  buildPluginsCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.plugins.model.PluginsModel",
      fieldSet: "id,name",
      valueField: "id",
      displayField: "name",
      editable: true,
      forceSelection: true
    };
  },
  buildTbar: function() {
    let items = [];

    items.push({
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-refresh",
      action: "refresh"
    });

    return items;
  }
});
