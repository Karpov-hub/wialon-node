LOCALE = {};
Glob = {};

Ext.Loader.setConfig({
  enabled: true,
  paths: {
    Core: "app/core",
    Crm: "app/crm",
    Admin: "classic/src",
    Desktop: "app",
    main: "app/main"
  }
});

Ext.create("Ext.tip.ToolTip");

Ext.application({
  name: "Admin",
  extend: "Admin.Application",
  requires: ["Admin.*", "Crm.*", "main.*", "Core.*"],
  mainView: "Admin.view.main.Viewport"
});
