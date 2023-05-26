Ext.define("Crm.modules.adminLogs.view.adminLogsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Admin actions logs"),
  iconCls: "x-fa fa-list",

  filterbar: true,

  detailsInDialogWindow: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Creation date"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "date",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s O");
        }
      },
      {
        text: D.t("Data"),
        flex: 2,
        sortable: true,
        filter: false,
        dataIndex: "data"
      },
      {
        text: D.t("Result"),
        flex: 2,
        sortable: true,
        filter: false,
        dataIndex: "result"
      },
      {
        text: D.t("Admin"),
        flex: 1,
        sortable: true,
        dataIndex: "admin_id",
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "_id",
          displayField: "login",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.users.model.UsersModel"),
            fieldSet: ["_id", "login"],
            scope: this
          })
        },
        renderer: (v) => {
          return v.name || v.login;
        }
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push({
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-refresh",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: D.t("View log"),
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
