Ext.define("Admin.Application", {
  extend: "Ext.app.Application",
  name: "Admin",
  stores: ["NavigationTree"],
  init: function() {
    Glob.Ajax = Ext.create("Core.Ajax");
  },
  defaultToken: "authentication.login",
  onAppUpdate: function() {
    Ext.Msg.confirm(
      "Application Update",
      "This application has an update, reload?",
      function(choice) {
        if (choice === "yes") {
          window.location.reload();
        }
      }
    );
  }
});
