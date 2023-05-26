Ext.define("Core.form.UploadField", {
  extend: "Ext.form.FieldContainer",
  alias: "widget.uploadfielddb",

  mixins: {
    field: "Ext.form.field.Field"
  },

  requires: ["Ext.form.field.File", "Core.Ajax"],

  width: 200,
  height: 25,
  layout: "hbox",

  initComponent: function() {
    this.createContextMenu();
    this.items = this.buildItems();

    this.value = {};
    this.createContextMenu();

    this.callParent();
  },

  createContextMenu: function() {
    var me = this;
    me.contextMenu = Ext.create("Ext.menu.Menu", {
      items: [
        {
          text: D.t("Remove file"),
          iconCls: "remove",
          handler: function() {
            me.removeFile();
          }
        }
      ]
    });
  },

  buildItems: function() {
    var me = this;

    var rec = [];

    var func = function() {
      var w = parseInt(me.width / 2);
      rec.push(
        {
          xtype: "filefield",
          msgTarget: "side",
          allowBlank: true,
          buttonOnly: true,
          width: w + 10,
          height: me.height,
          //fieldStyle: 'width:'+ me.width +'px;height:' + me.height+'px;',
          buttonConfig: {
            //tooltip: D.t('Select file'),
            text: me.buttonText || D.t("Select file"),
            width: w,
            height: me.height
          },
          listeners: {
            change: function(el) {
              me.upload(el);
            }
          }
        },
        {
          xtype: "label"
        }
      );
    };

    func();

    return rec;
  },

  upload: function(inp) {
    var me = this;
    if (inp.fileInputEl.dom.files.length > 0) {
      var fn =
        inp.fileInputEl.dom.files[0].name ||
        inp.fileInputEl.dom.files[0].fileName;

      Glob.Ajax.upload(
        inp.fileInputEl.dom.files[0],
        "/Admin.Data.uploadFile/",
        function(data) {
          if (data.response && data.response.name) {
            var o = {
              name: fn,
              tmpName: data.response.name,
              link:
                "/Admin.Data.getFile/?name= " +
                encodeURIComponent(fn) +
                "&tmp=" +
                encodeURIComponent(data.response.name)
            };
            me.fireEvent("upload", o);
            me.setValue(o);
            inp.fileInputEl.dom.value = "";
          }
        }
      );
    }
  },

  removeFile: function() {
    this.down("[xtype=label]").setText("");
    this.value = null;
  },

  setValue: function(value) {
    var me = this,
      btn = me.down("[xtype=filefield]").button,
      label = me.down("[xtype=label]");
    this.value = value;
    if (!value) {
      label.setText("");
      btn.on("contextmenu", function(e) {
        e.preventDefault();
      });
      return;
    }
    label.setText('<a href="' + value.link + '">' + value.name + "</a>", false);
    btn.on("contextmenu", function(e) {
      e.preventDefault();
      me.contextMenu.show(btn);
    });
    label.on("contextmenu", function(e) {
      e.preventDefault();
      me.contextMenu.show(label);
    });
  },

  getValue: function() {
    return this.value;
  },

  getSubmitData: function() {
    var res = {};
    res[this.name] = this.getValue();
    return res;
  }
});
