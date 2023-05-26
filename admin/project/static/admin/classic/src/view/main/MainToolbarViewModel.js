Ext.define("Admin.view.main.MainToolbarViewModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.observWs();
    this.observMsg();
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
      id = localStorage.getItem("uid");
    Ext.ProfileModel = Ext.create("Crm.modules.profile.model.ProfileModel", {
      recordId: id,
      onRecordUpdate: function(data) {
        if (data.photo === undefined) {
          data.photo =
            me.get("user").photo.split("?")[0] + "?_dc=" + new Date().getTime();
        }
        me.set("user", data);
      }
    });

    Ext.ProfileModel.readRecord(id, function(data) {
      data.name = data.name || data.login;
      me.set("user", data);

      if (data.preferences) Ext.userPreferences = data.preferences;
      else Ext.userPreferences = {};
    });
  },

  observMsg: function() {
    if (!Core.ws) {
      setTimeout(() => {
        this.observMsg();
      }, 1000);
      return;
    }

    this.msgObj = Ext.create("Crm.modules.messages.model.MessagesModel");
    this.bgProcessObj = Ext.create("Crm.modules.messages.model.BgProcessModel");

    this.setMsgCount();
    this.setBgCount();

    Core.ws.subscribe(
      "Crm.modules.messages.model.MessagesModel",
      "Crm.modules.messages.model.MessagesModel",
      (action, data) => {
        if (
          data &&
          data.touser &&
          data.touser.indexOf(localStorage.getItem("uid")) != -1
        ) {
          this.setMsgCount();
        }
      }
    );

    Core.ws.subscribe(
      "Crm.modules.messages.model.BgProcessModel",
      "Crm.modules.messages.model.BgProcessModel",
      (action, data) => {
        this.setBgCount();
      }
    );
  },

  setMsgCount: function() {
    this.msgObj.getNewMessagesCount(cnt => {
      this.set("newMsg", cnt ? "online" : "offline");
      this.set("msgCount", cnt ? cnt : "");
    });
  },

  setBgCount: function() {
    this.bgProcessObj.getBgCount(data => {
      this.set("inProgress", data.res && data.res.length ? "1" : "0");
      this.set(
        "inProgressCount",
        data.res && data.res.length ? data.res.length : ""
      );
    });
  }
});
