Ext.define("main.GridController", {
  extend: "Core.grid.GridController",
  

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
            me.addUpdateRecord(rec.data);
          }
        },
        celldblclick: function(cell, td, i, rec) {
          me.addUpdateRecord(rec.data);
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
      me.addUpdateRecord(grid.getStore().getAt(indx).data);
    });
    this.view.on("delete", function(grid, indx) {
      me.deleteRecord(grid.getStore(), indx);
    });
    this.initButtonsByPermissions();
    //this.view.on('modify', function(id) {alert();me.modify(id)})
  },

  addRecord: function() {
    var me = this;
    me.addUpdateRecord();
  }

  ,addUpdateRecord:function(request){
    var me = this, addWin;
    var addBtn = me.view.down('[action=add]');
    if (addBtn) { addBtn.disable(); }
    // function validatorTxt(v){
    //     return (v && v.toString().trim()!="")?true:" Field should be valid.";
    // }
    var formItems = me.view.buildFormItems(request);
    formItems.push({
      xtype: 'fieldcontainer',
      anchor: '100%',
      layout: 'hbox',
      align: 'center',
      margin: { top: 15 },
      items: [{
        xtype: 'button',
        text: D.t('Save'),
        iconCls: 'x-fa fa-check-square-o',
        formBind: true,
        listeners: {
          click: function (e, v) {
            var actionBtn = e;
            var A=document.getElementById("loadDiv");
            A.style.display="block";
            if (actionBtn) { actionBtn.disable(); }
            var reqData = this.up('form').getValues() || {};
            if (request && request.id) {
              reqData.id = request.id;
            }
            me.model.write(reqData, function (data, err) {
              A.style.display="none";
              if (data && data.error) {
                if (actionBtn) { actionBtn.enable(); }
                D.a('Error', (data.error && data.error.message) ?
                  data.error.message : "Something went wrong.");
              }
              else if (data.validationErrors) {
                if (actionBtn) { actionBtn.enable(); }
                var errorHtml = "";
                errorHtml = "<table border=\"1\"><tr><th>field</th><th>Error</th></tr>";
                data.validationErrors.forEach(error => {
                  errorHtml += "<tr><td>" + error.field + "</td><td>" + error.message + "</tr>";
                })
                errorHtml += "</table>";
                D.a('Validations Errors:', errorHtml);
              }
              else {
                D.a('Success', 'Action completed successfully.');
                addWin.close();
              }
            })
          }
        }
      }, {
        xtype: 'button',
        margin: { left: 5 },
        text: D.t('Close'),
        iconCls: 'x-fa fa-ban',
        listeners: {
          click: function () {
            addWin.close();
          }
        }
      }]
    });
    addWin = Ext.create('Ext.window.Window', {
      width: '70%',

      name: 'notesWin',

      title: 'Record',

      iconCls: 'x-fa fa-files-o',

      modal: true,

      items: [{
        xtype: 'form',
        layout: 'anchor',
        padding: 10,
        defaults: { xtype: 'textfield', anchor: '100%', labelWidth: 100 },
        items: formItems
      }]
      ,listeners: {
        close: function () {
          if (addBtn) {
            addBtn.enable();
          }
          if (me && me.view && me.view.store) {
            me.view.store.reload();
          }
        }
      }
    }).show();
  }

 
});
