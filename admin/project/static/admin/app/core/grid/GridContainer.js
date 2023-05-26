Ext.define("Core.data.StoreGrid", {
  extend: "Core.data.Store",
  remoteFilter: true,
  remoteSort: true,
  statefulFilters: true
});

Ext.define("Core.grid.GridContainer", {
  extend: "Admin.view.main.AbstractContainer",

  buttonAddText: D.t("Add"),
  buttonAddTooltip: D.t("Add a new row"),
  buttonImportText: D.t("Import"),
  buttonExportText: D.t("Export"),
  buttonReloadText: D.t("Reload data"),
  searchFieldText: D.t("Search"),
  buttonEditTooltip: D.t("Edit the record"),
  buttonDeleteTooltip: D.t("Delete the record"),

  requires: [
    "Ext.grid.column.Date",
    "Ext.grid.Panel",
    "Ext.grid.feature.Summary",
    "Ext.util.Format",
    "Ext.grid.RowNumberer",
    "Desktop.core.widgets.SearchField",
    "Ext.ux.grid.FilterBar",
    "Ext.ux.grid.AutoResizer"
  ],

  initComponent: function() {
    var me = this;
    this.model = this.createModel();
    if (this.controllerCls) {
      this.controller = Ext.create(this.controllerCls);
    } else if (!this.controller)
      this.controller = Ext.create("Core.grid.GridController");
    var buttons = this.buildButtonsColumns();
    this.columns = buttons
      ? this.buildColumns().concat(buttons)
      : this.buildColumns();

    this.store = this.createStore();

    if (!this.observe) this.items = this.buildItems();

    this.callParent(arguments);

    if (this.observe && this.scope) {
      this.setObserve();
      this.on("render", function() {
        me.add(me.buildItems());
      });
    }

    document.getElementById("main-view-detail-wrap").scrollTop = 0;
  },

  // Грид не нужно убирать с панели при переключении окна
  removeFromPanel: function() {
    return;
  },

  createModel: function() {
    if (this.model)
      return Ext.isString(this.model) ? Ext.create(this.model) : this.model;
    var m = Object.getPrototypeOf(this).$className.replace(".view.", ".model.");

    if (m.substr(-4) == "Grid") m = m.substr(0, m.length - 4) + "Model";
    else m += "Model";

    return Ext.create(m);
  },

  createStore: function() {
    var me = this;
    if (me.store)
      return Ext.isString(me.store) ? Ext.create(me.store) : me.store;

    if (me.columns && !me.fields) {
      me.fields = [];
      if (me.sortManually) me.fields.push("indx");
      for (var i = 0; i < me.columns.length; i++) {
        if (me.columns[i].dataIndex) {
          me.fields.push(me.columns[i].dataIndex);
        }
      }
    }
    return Ext.create("Core.data.StoreGrid", me.getStoreConfig());
  },

  getStoreConfig: function() {
    return {
      filterParam: "q",
      remoteFilter: true,
      remoteSort: true,
      dataModel: this.model,
      scope: this,
      scrollable: true,
      pageSize: this.pageSize,
      fieldSet: this.fields,
      autoLoad: !this.observe
    };
  },

  buildTbar: function() {
    var items = [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add"
      }
    ];

    if (this.importButton) {
      items.push("-", {
        text: this.buttonImportText,
        iconCls: "x-fa fa-cloud-download",
        action: "import"
      });
    }
    if (this.exportButton) {
      items.push("-", {
        text: this.buttonExportText,
        iconCls: "x-fa fa-cloud-upload",
        action: "export"
      });
    }

    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-refresh",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildPlugins: function() {
    let plugins = [];

    if (this.filterbar) {
      plugins.push({
        ptype: "filterbar",
        renderHidden: false,
        showShowHideButton: true,
        showClearAllButton: true
      });
    }

    return plugins;
  },

  buildItems: function() {
    let plugins = this.buildPlugins(),
      columns = { items: this.columns };

    if (this.filterbar) {
      columns.plugins = [
        {
          ptype: "gridautoresizer"
        }
      ];
    }

    var cfg = {
      xtype: "grid",
      plugins: plugins,
      title: this.title,
      iconCls: this.iconCls,
      store: this.store,
      tbar: this.buildTbar(),
      bbar: this.buildPaging(),
      columns: columns
    };
    if (this.gridCfg) {
      for (var i in this.gridCfg) cfg[i] = this.gridCfg[i];
    }
    return cfg;
  },

  buildPaging: function() {
    var pg = Ext.create("Ext.PagingToolbar", {
      store: this.store,
      displayInfo: true,
      //displayMsg: D.t('Displaying topics {0} - {1} of {2}'),
      //emptyMsg: D.t("No topics to display"),
      items: this.buildBbar()
    });

    if (this.store) {
      this.store.on("load", function(st, data) {
        if (!data.length && pg) {
          var ap = pg.getPageData();
          if (ap.currentPage > 1) {
            pg.movePrevious();
          }
        }
      });
    }
    return pg;
  },

  buildBbar: function() {
    if (this.filterable) return [this.buildSearchField()];

    return null;
  },

  buildSearchField: function() {
    return {
      anchor: "100%",
      emptyText: this.searchFieldText,
      margin: "0 10 0 20",
      xtype: "xsearchfield",
      store: this.store
    };
  },

  buildColumns: function() {},

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-pencil-square-o",
            tooltip: this.buttonEditTooltip,
            isDisabled: function() {
              return !me.permis.modify && !me.permis.read;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-trash",
            tooltip: this.buttonDeleteTooltip,
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

  setObserve: function() {
    var me = this;
    me.scope.on("render", function() {
      me.store.setAutoLoad(false);
      me.observe.forEach(function(item) {
        var el = me.scope.down("[name=" + item.param + "]");

        el.on("change", function(el, v) {
          if (v || v === 0) {
            me.observeObject = {};
            me.observeObject[item.property] = v;
            setTimeout(() => {
              me.store.addFilter({
                property: item.property,
                value: v
              });
            }, 0);
            var isInFilters = function(filters) {
              for (var i = 0; i < filters.length; i++) {
                if (filters[i]._property == item.property) {
                  return true;
                }
              }
              return false;
            };
            var l = true;
            me.store.on("filterchange", function(st, filters, eOpts) {
              //console.log(filters)
              if (l) {
                if (!isInFilters(filters)) {
                  l = false;
                  if (v)
                    me.store.addFilter({
                      property: item.property,
                      value: v
                    });
                }
              } else l = true;
            });
          }
        });
      });
    });
  }
});
