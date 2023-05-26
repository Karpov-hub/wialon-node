Ext.define("Crm.modules.permissions.view.ReportLabelsTranslationsGrid", {
  extend: "Core.grid.GridContainer",
  detailsInDialogWindow: true,

  buildColumns() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "report_id",
        hidden: true
      },
      {
        text: D.t("Lang"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "lang"
      }
    ];
  },

  setObservableFilter(me, item, v) {
    me.observeObject = {};
    me.observeObject[item.property] = v;

    setTimeout(() => {
      me.store.addFilter({
        property: item.property,
        value: v
      });
    }, 0);

    const isInFilters = function(filters) {
      for (let i = 0; i < filters.length; i++) {
        if (filters[i]._property == item.property) {
          return true;
        }
      }
      return false;
    };

    let l = true;

    me.store.on("filterchange", function(st, filters, eOpts) {
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
  },

  setObserve: function() {
    const me = this;

    me.scope.on("render", function() {
      me.store.setAutoLoad(false);
      me.observe.forEach(function(item) {
        const el = me.scope.down("[name=" + item.param + "]");
        if (el.getValue()) {
          me.setObservableFilter(me, item, el.getValue());
        }
        el.on("change", function(el, v) {
          if (v || v === 0) {
            me.setObservableFilter(me, item, v);
          }
        });
      });
    });
  }
});
