Ext.define("Core.data.viewModel", {
  extend: "Ext.app.ViewModel",

  constructor() {
    this.observWs();
    this.callParent(arguments);
  },

  observWs: function() {
    var me = this;
    if (!Glob.ws) {
      setTimeout(function() {
        me.observWs();
      }, 1000);
      return;
    }
    var lostEv = function() {
      me.set("status", "offline");
    };
    var okEv = function() {
      me.set("status", "online");
    };
    okEv();
    Glob.ws.on("open", okEv);
    Glob.ws.on("error", lostEv);
    Glob.ws.on("close", lostEv);
    this.readUserProfile();
  },

  readUserProfile: function() {
    var me = this,
      model = Ext.create("Crm.modules.profile.model.ProfileModel");
    model.readRecord(localStorage.getItem("uid"), function(data) {
      data.name = data.name || data.login;
      me.set("user", data);
    });
  }
});
