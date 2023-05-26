Ext.define("Core.grid.EditableGridController", {
  extend: "Core.grid.GridController",

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
      }
    });

    this.view.on("delete", function(grid, indx) {
      me.deleteRecord(grid.getStore(), indx);
    });
    this.view.on("edit", function(editor, e) {
      me.onEdit(editor, e);
    });
    this.initButtonsByPermissions();
  },

  initButtonsByPermissions: function() {
    var me = this;
    this.view.model.getPermissions(function(permis) {
      me.view.permis = permis;
      if (!permis.add) {
        me.view.down("[action=add]").setDisabled(true);
      }
      if (!permis.modify) {
        me.view.pluginCellEditing.disable(true);
      }
    });
  },

  observeData: function(data) {
    var d = data ? data : {};
    if (!!this.view.observe) {
      var x = this.view.up("form");
      if (x) {
        this.view.observe.forEach(function(itm) {
          var e = x.down("[name=" + itm.param + "]");
          if (e) {
            switch (itm.operator) {
              case "in":
                if (!Array.isArray(d[itm.property])) {
                  d[itm.property] = [];
                }
                var value = e.getValue();
                var exist = false;
                for (var i = 0; i < d[itm.property].length; i++) {
                  if (d[itm.property][i] == value) {
                    exist = true;
                    break;
                  }
                }
                if (!exist) {
                  d[itm.property] = value;
                }
                d[itm.property] = [e.getValue()];
                break;
              default:
                d[itm.property] = e.getValue();
            }
          }
        });
      }
    }
    return d;
  },
  addRecord: function() {
    var d = this.observeData();
    d.id = "";
    var first = this.view.store.insert(0, d)[0];
    this.view.cellEditing.startEdit(first, this.view.firstEditableColumn);
  },

  onEdit: function(editor, e) {
    var me = this;
    e.record.data = me.observeData(e.record.data);

    me.view.model.write(e.record.data, function(data, err) {
      if (me.view.fireEvent("save", me.view, data, e.record) === false) {
        return;
      }
      if (data && data.record) {
        e.record.data = e.record.data; //data.record
        e.record.commit();
      }
    });
  }
});
