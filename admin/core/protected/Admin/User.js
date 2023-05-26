Ext.define("Admin.User", {
  extend: "Core.Controller",

  $login: function() {
    var me = this;

    me.callModel(
      "Admin.model.User.getAutorization",
      {
        collection: "admin_users",
        find: { login: me.params.gpc.login, removed: { $ne: true } },
        password: me.params.gpc.pass
      },
      function(user) {
        if (user) {
          me.src.db.collection("groups").findOne(
            {
              _id: user.user.groupid
            },
            { autorun: 1 },
            function(e, d) {
              if (d) user.autorun = d.autorun;

              me.setCookie("token", user.token, null, null, "/", true);
              user.token = new Date().getTime();
              me.sendJSON(user);
            }
          );
        } else me.error(401);
      }
    );
  },

  $loginStepTwo: function() {
    var me = this;
    me.callModel(".model.User.enter2step", me.params.gpc).sendJSON();
  },

  $getModulesList: function() {
    this.params.gpc.auth = "?";
    this.callModel(".model.Modules.getUserModules", this.params.gpc).sendJSON();
  },

  $getAllModulesList: function() {
    this.params.gpc.auth = "?";
    this.callModel(".model.Modules.getAllModules", this.params.gpc).sendJSON();
  },

  $getNavigationTree: function() {
    var me = this;
    this.params.gpc.auth = "?";
    this.callModel(".model.User.getUserInfo", this.params.gpc, function(res) {
      //.group.modelaccess)
      me.sendText("123");
    });
  },

  $getUserInfo: function() {
    this.params.gpc.auth = "?";
    this.callModel(".model.User.getUserInfo", this.params.gpc).sendJSON();
  },

  $setUserSets: function() {
    this.params.gpc.auth = "?";
    this.callModel(".model.User.setUserSets", this.params.gpc).sendJSON();
  },

  $testAuth: function() {
    var me = this;
    me.checkAuthorization(me.params.gpc, function(auth) {
      me.sendJSON({ result: auth });
    });
  }
});
