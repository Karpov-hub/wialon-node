Ext.define("Crm.modules.customReports.view.customReportsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Custom Report Request"),
  iconCls: "x-fa fa-file-text",
  controllerCls: "Crm.modules.customReports.view.customReportsGridController",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    let me = this;
    this.fields = [
      "id",
      "organization_id",
      "user_id",
      "user_email",
      "attachment_name",
      "html",
      "ctime"
    ];

    return [
      {
        text: D.t("User Email"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "user_email"
      },
      {
        text: D.t("Organization"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "organization_id",
        renderer: function(v, r, m) {
          if (v && v.organization_name) {
            v = v.organization_name;
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
      },
      {
        xtype: "actioncolumn",
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-download",
            tooltip: D.t("Download"),
            isDisabled: (g, index) => {
              if (
                g.store.getAt(index).data.attachment_name == null ||
                g.store.getAt(index).data.attachment_name == ""
              )
                return true;
              return false;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("download", this.store.getData().items, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-trash",
            tooltip: D.t("Delete"),
            isDisabled: function() {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowexpander",
      rowBodyTpl: this.detailsTpl()
    });

    return plugins;
  },

  detailsTpl() {
    return new Ext.XTemplate(
      "<table width='100%'><tr valign=top>",
      `<td width='50%' style="border-right: solid 1px #f00;">
      <tpl if="html">{html}</tpl>
      <!-- <tpl if="attachment_name"><a href="http://84.201.184.53:8012/download/e9940bc0-52ea-11ea-87e6-43923907b076">Download</a></tpl> -->`,
      "</td><td>",
      `<tpl if="html"><xmp style="font-family: monospace; padding: 5px !important; text-align: initial">{html}</xmp></tpl>`,
      "</td></tr></table>"
    );
  },
  buildButtonsColumns() {
    return [];
  },
  buildTbar() {
    let items = this.callParent();
    items.splice(0, 1);
    return items;
  }
});
