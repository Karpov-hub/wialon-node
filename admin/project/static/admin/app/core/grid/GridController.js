Ext.define("Core.grid.GridController", {
  extend: "Ext.app.ViewController",

  init: function(view) {
    this.view = view;
    this.model = this.view.model;
    this.setControls();
  },

  setControls: function() {
    var me = this;
    this.control({
      "[action=add]": {
        click: function(el) {
          me.addRecord();
        }
      },
      "[action=refresh]": {
        click: function(el) {
          me.reloadData();
        }
      },
      "[action=import]": {
        click: function(el) {
          me.importData();
        }
      },
      "[action=export]": {
        click: function(el) {
          me.exportData();
        }
      },
      grid: {
        cellkeydown: function(cell, td, i, rec, tr, rowIndex, e, eOpts) {
          if (e.keyCode == 13) {
            me.gotoRecordHash(rec.data);
          }
        },
        celldblclick: function(cell, td, i, rec) {
          me.gotoRecordHash(rec.data);
        },
        itemcontextmenu: function(vw, record, item, index, e, options) {
          e.stopEvent();
          //if(win.menuContext) {
          //    win.menuContext.record = record;
          //    win.menuContext.showAt(e.pageX, e.pageY);
          //}
        }
      }
    });
    this.view.on("activate", function(grid, indx) {
      if (!me.view.observeObject)
        document.title = me.view.title + " " + D.t("ConsoleTitle");
    });
    this.view.on("edit", function(grid, indx) {
      me.gotoRecordHash(grid.getStore().getAt(indx).data);
    });
    this.view.on("delete", function(grid, indx) {
      me.deleteRecord(grid.getStore(), indx);
    });
    this.initButtonsByPermissions();
    //this.view.on('modify', function(id) {alert();me.modify(id)})
  },

  initButtonsByPermissions: function() {
    var me = this;
    this.view.model.getPermissions(function(permis) {
      me.view.permis = permis;
      if (!permis.add) {
        var addBtn = me.view.down("[action=add]");
        if (addBtn) addBtn.setDisabled(true);
      }
    });
  },

  reloadData: function() {
    this.view.store.reload();
  },

  deleteRecord: function(store, index) {
    this.deleteRecord_do(store, store.getAt(index));
  },

  deleteRecord_do: function(store, rec) {
    var me = this;
    D.c("Removing", "Delete the record?", [], function() {
      me.view.model.remove([rec.data[me.view.model.idField]], function() {
        store.remove(rec);
      });
    });
  },

  addRecord: function() {
    var me = this;
    me.view.model.getNewObjectId(function(_id) {
      if (!!me.view.observeObject) {
        window.__CB_REC__ = me.view.observeObject;
        //window.__CB_REC__[me.view.model.idField] = _id
      }
      var oo = {};
      oo[me.view.model.idField] = _id;
      me.gotoRecordHash(oo);
    });
  },

  modify: function(data) {
    var id = data
        ? Ext.isString(data)
          ? data
          : data[this.view.model.idField]
        : null,
      cls = this.view.detailView || this.generateDetailsCls();
    return Ext.isString(cls)
      ? Ext.create(cls, {
          recordId: id,
          scope: this.view
        })
      : cls;
  },

  generateDetailsCls: function() {
    var cls = Object.getPrototypeOf(this.view).$className;
    return (
      (["Grid", "Tree"].indexOf(cls.substr(-4)) != -1
        ? cls.substr(0, cls.length - 4)
        : cls) + "Form"
    );
  },

  gotoRecordHash: function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    if (data && data[this.view.model.idField]) {
      var hash =
        this.generateDetailsCls() + "~" + data[this.view.model.idField];
      if (this.view.detailsInDialogWindow) {
        Ext.create(this.generateDetailsCls(), {
          noHash: true,
          recordId: data[this.view.model.idField]
        });
      } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
      else location.hash = hash;
    }
  },

  importData: function() {
    Ext.create("Core.grid.ImportWindow", {
      model: this.view.model
    });
  },

  exportData: function() {
    console.log(this.view.store.getFilters());
  }
});
