Ext.define("Crm.modules.support.view.SupportGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Support"),
  iconCls: "x-fa fa-question",
  detailsInDialogWindow: true,
  // controllerCls: "Crm.modules.support.view.SupportGridController",

  filterable: true,
  filterbar: true,

  fields: [
    "id",
    "ctime",
    "number_of_ticket",
    "title",
    "category",
    "status",
    "message",
    "new",
    "user_id"
  ],

  buildColumns: function() {
    const rendererForColor = (v, m, r) => {
      if (r.data.status === 0) {
        m.tdCls = "custom-expired-row";
      }
      return v;
    };
    return [
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i:s O",
        text: D.t("Date"),
        flex: 1,
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" },
        renderer: (v, m, r) => {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s O");
        }
      },
      {
        text: D.t("Username"),
        flex: 1,
        sortable: true,
        dataIndex: "user_id",
        filter: this.buildUsersCombo(),
        renderer: function(v, m, r) {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          if (!v) return "";
          return (
            '<a href="#Crm.modules.accountHolders.view.UsersForm~' +
            v.id +
            '">' +
            v.name +
            "</a>"
          );
        }
      },
      {
        text: D.t("Number of ticket"),
        flex: 1,
        sortable: true,
        dataIndex: "number_of_ticket",
        filter: true,
        renderer: rendererForColor
      },
      {
        text: D.t("Title"),
        flex: 1,
        sortable: true,
        dataIndex: "title",
        filter: true,
        renderer: rendererForColor
      },
      {
        text: D.t("Category"),
        flex: 1,
        sortable: true,
        dataIndex: "category",
        filter: this.buildCategoryCombo(),
        renderer: (v, m, r) => {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          return D.t({ 0: "General Questions", 1: "Reports", 2: "Tarrifs" }[v]);
        }
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        dataIndex: "status",
        filter: this.buildStatusCombo(),
        renderer: (v, m, r) => {
          if (r.data.status === 0) {
            m.tdCls = "custom-expired-row";
          }
          return D.t({ 0: "Open", 1: "Resolved", 2: "Closed" }[v]);
        }
      },
      {
        dataIndex: "new",
        hidden: true
      }
    ];
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowwidget",
      onWidgetAttach: function(plugin, view, record) {
        view.down("panel").setData(record.data);
      },
      widget: {
        xtype: "container",
        layout: {
          type: "vbox",
          pack: "start",
          align: "stretch"
        },
        items: [
          {
            xtype: "panel",
            cls: "transfer-details",
            //padding: 10,
            tpl: new Ext.XTemplate("{message}")
          }
        ]
      }
    });
    return plugins;
  },
  buildTbar() {
    let items = this.callParent();
    items.splice(0, 1);
    return items;
  },

  buildUsersCombo() {
    return {
      xtype: "dependedcombo",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,name",
      valueField: "id",
      displayField: "name",
      name: "user_id",
      allowBlank: false,
      editable: true,
      forceSelection: true
    };
  },

  buildCategoryCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "value",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["value", "text"],
        data: [
          [0, D.t("General Questions")],
          [1, D.t("Reports")],
          [2, D.t("Tarrifs")]
        ]
      }),
      name: "category"
    };
  },

  buildStatusCombo: function() {
    return {
      xtype: "combo",
      editable: false,
      valueField: "value",
      displayField: "text",
      queryMode: "local",
      anchor: "100%",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["value", "text"],
        data: [
          [0, D.t("Open")],
          [1, D.t("Resolved")],
          [2, D.t("Closed")]
        ]
      }),
      name: "status"
    };
  }
});
