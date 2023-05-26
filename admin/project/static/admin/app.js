Ext.Loader.setConfig({
  enabled: true,
  paths: {
    Core: "app/core",
    Crm: "crm",
    Admin: "classic/src",
    Desktop: "app",
    main: "app/main"
  }
});

LOCALE = {};
Glob = {};

Ext.create("Ext.tip.ToolTip");

Ext.application({
  name: "Admin",
  extend: "Admin.Application",
  requires: ["Admin.*", "main.*", "Core.*"],
  mainView: "Admin.view.main.Viewport"
});
