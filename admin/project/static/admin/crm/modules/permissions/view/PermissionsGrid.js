Ext.define("Crm.modules.permissions.view.PermissionsGrid", {
  extend: "Core.grid.EditableGrid",

  title: D.t("Permissions"),
  iconCls: "fa fa-info-circle",
  requires: ["Core.grid.ComboColumn"],

  filterbar: true,
  filterable: true,

  controllerCls: "Crm.modules.permissions.view.PermissionsGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Routes"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "role"
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "description"
      },
      {
        text: D.t("Super Admin"),
        xtype: "checkcolumn",
        sortable: true,
        flex: 1,
        dataIndex: "super_admin",
        editor: {
          xtype: "checkbox",
          cls: "x-grid-checkheader-editor"
        }
      },
      {
        text: D.t("Admin"),
        sortable: true,
        flex: 1,
        dataIndex: "admin",
        editor: { xtype: "checkbox" }
      },
      {
        text: D.t("User"),
        sortable: true,
        flex: 1,
        dataIndex: "user",
        editor: { xtype: "checkbox" }
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push(
      "-",
      {
        tooltip: D.t("Reload data"),
        iconCls: "x-fa fa-refresh",
        action: "refresh",
        text: "Refresh."
      },
      "-",
      {
        xtype: "label",
        name: "editLabel",
        text: "Editable Grid: Double click on row cell to enter/edit values.",
        style: "font-weight: bold;font-size: 12px;"
      }
    );
    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    return [];
  }
});
