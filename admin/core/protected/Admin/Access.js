Ext.define("Admin.Access", {
  extend: "Core.Controller",

  $checkModel: function() {
    this.params.gpc.auth = "?";
    this.callModel(".model.Modules.checkAccess", this.params.gpc).sendJSON();
  },

  $Navigation: function() {
    var me = this;
    //this.params.gpc.auth = '?'

    me.callModel(
      "Admin.model.User.getUserAccessRates",
      { auth: me.user.id },
      function(permis) {
        me.sendText("");
      }
    );
  }
});
