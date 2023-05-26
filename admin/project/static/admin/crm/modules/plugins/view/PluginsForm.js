Ext.define("Crm.modules.plugins.view.PluginsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Plugin") + ": {name} | {id}",
  iconCls: "fa fa-puzzle-piece",

  buildItems: function() {
    return [
      {
        name: "id",
        xtype: "textfield",
        readOnly: true,
        fieldLabel: D.t("ID"),
        flex: 1
      },
      {
        name: "name",
        xtype: "textfield",
        fieldLabel: D.t("Name"),
        allowBlank: false,
        maxLength: 255,
        flex: 1
      },
      {
        xtype: "xdatefield",
        name: "ctime",
        fieldLabel: D.t("Created time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        readOnly: true
      },
      {
        xtype: "xdatefield",
        name: "mtime",
        fieldLabel: D.t("Update time"),
        format: D.t("d.m.Y H:i:s O"),
        flex: 1,
        readOnly: true
      }
    ];
  }
});
