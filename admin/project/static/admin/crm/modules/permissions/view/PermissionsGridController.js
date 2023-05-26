Ext.define("Crm.modules.permissions.view.PermissionsGridController", {
  extend: "Core.grid.EditableGridController",

  initButtonsByPermissions: function() {
    const me = this;
    this.view.model.getPermissions(function(permis) {
      me.view.permis = permis;
      if (!permis.add && me.view.down() && me.view.down("[action=add]")) {
        me.view.down("[action=add]").setDisabled(true);
      }
      if (!permis.modify && me.view.pluginCellEditing) {
        me.view.pluginCellEditing.disable(true);
      }
      if (
        !permis.modify &&
        me.view.down() &&
        me.view.down("[name=editLabel]")
      ) {
        me.view.down("[name=editLabel]").hide();
      }
    });
  }
});
