Ext.define("Core.form.FormController", {
  extend: "Ext.app.ViewController",

  init: function(view) {
    var me = this;
    if (!this.compDomain) this.compDomain = new Ext.app.domain.View(this);
    this.view = view;
    this.model = this.createModel();

    me.loadData(function(data) {
      me.setTitle(data);
      me.setFieldsDisable(function() {});
    });
    this.setControls();
  },

  setControls: function() {
    var me = this;
    this.control({
      "[action=formclose]": {
        click: function(el) {
          me.closeView();
        }
      },
      "[action=apply]": {
        click: function(el) {
          me.save(false);
        }
      },
      "[action=save]": {
        click: function(el) {
          me.save(true);
        }
      },
      "[action=remove]": {
        click: function(el) {
          me.deleteRecord_do(true);
        }
      },
      "[action=copy]": {
        click: function(el) {
          me.copyRecord(true);
        }
      },
      "[action=gotolist]": {
        click: function(el) {
          me.gotoListView(true);
        }
      },
      "[action=exportjson]": {
        click: () => {
          this.exportJson();
        }
      },
      "[action=importjson]": {
        change: (el) => {
          this.importJson();
        }
      }
    });

    this.view.on("activate", function(grid, indx) {
      if (!me.oldDocTitle) me.oldDocTitle = document.title;
    });
    this.view.on("close", function(grid, indx) {
      if (me.oldDocTitle) document.title = me.oldDocTitle;
    });
    this.view.down("form").on({
      validitychange: function(th, valid, eOpts) {
        var el = me.view.down("[action=apply]");
        if (el) el.setDisabled(!valid);
        el = me.view.down("[action=save]");
        if (el) el.setDisabled(!valid);
      }
    });
    this.checkPermissions();
  },

  closeView: function() {
    if (Ext.historyLength) window.history.go(-1);
    else this.view.close();
  },

  checkPermissions: function() {
    var me = this,
      el;
    this.model.getPermissions(function(permis) {
      if (!permis.modify && !permis.add) {
        el = me.view.down("[action=apply]");
        if (el) el.setDisabled(true);
        el = me.view.down("[action=save]");
        if (el) el.setDisabled(true);
        me.setFormReadOnly();
      }
      if (!permis.del) {
        el = me.view.down("[action=remove]");
        if (el) el.setDisabled(true);
      }
    });
  },
  setFormReadOnly: function() {
    this.view
      .query("textfield,combo,xdatefield,numberfield,checkbox,gridfield")
      .forEach(function(itm) {
        itm.setReadOnly(true);
      });
  },

  deleteRecord_do: function(store, rec) {
    var me = this;
    D.c("Removing", "Delete the record?", [], function() {
      var data = me.view
        .down("form")
        .getForm()
        .getValues();
      me.model.remove([data[me.model.idField]], function() {
        me.view.close();
      });
    });
  },

  copyRecord: function() {
    var me = this,
      data = this.view
        .down("form")
        .getForm()
        .getValues();
    me.model.getNewObjectId(function(_id) {
      data[me.model.idField] = _id;

      if (me.view.copyTexts) {
        for (var i in me.view.copyTexts) {
          data[i] += " " + me.view.copyTexts[i];
        }
      }

      me.model.write(data, function(data, err) {
        var cls = Object.getPrototypeOf(me.view).$className;
        me.view.close();
        setTimeout(function() {
          location = "./#" + cls + "~" + _id;
        }, 500);
      });
    });
  },

  createModel: function() {
    if (this.model)
      return Ext.isString(this.model) ? Ext.create(this.model) : this.model;

    if (this.view.model)
      return Ext.isString(this.view.model)
        ? Ext.create(this.view.model)
        : this.view.model;

    if (this.view.scope && this.view.scope.model) return this.view.scope.model;

    var m = Object.getPrototypeOf(this.view).$className.replace(
      ".view.",
      ".model."
    );

    if (m.substr(-4) == "Form") m = m.substr(0, m.length - 4) + "Model";
    else m += "Model";

    return Ext.create(m);
  },

  gotoListView: function() {
    location =
      "#" +
      Object.getPrototypeOf(this.view).$className.replace(/Form$/, "Grid");
  },

  loadData: function(callback) {
    var me = this;

    var cb = function(data) {
      if (!!me.afterDataLoad)
        me.afterDataLoad(data, function(data) {
          me.setValues(data);
          callback(data);
        });
      else {
        me.setValues(data);
        callback(data);
      }
    };

    if (this.view.recordId) {
      me.model.readRecord(this.view.recordId, function(data) {
        if (data && data.signobject) {
          if (data.signobject.shouldSign)
            me.view.addSignButton(data.signobject);
          if (data.signobject.blocked) {
            me.setFormReadOnly();
            var b = me.view.down("[action=save]");
            if (b) b.setDisabled(true);
            b = me.view.down("[action=apply]");
            if (b) b.setDisabled(true);
            b = me.view.down("[action=remove]");
            if (b) b.setDisabled(true);
          }
        }
        var oo = {};
        oo[me.model.idField] = me.view.recordId;
        cb(data[me.model.idField] ? data : oo);
      });
    } else {
      me.model.getNewObjectId(function(_id) {
        var oo = {};
        oo[me.model.idField] = _id;
        cb(oo);
      });
    }
  },

  setValues: function(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    this.view.currentData = data;
    var form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, data);
    form.getForm().setValues(data);
    this.view.fireEvent("setvalues", form, data);
  },

  setTitle: function(data) {
    if (this.view.titleTpl) {
      var ttl = new Ext.XTemplate(this.view.titleTpl).apply(data);
      this.view.setTitle(ttl);
      document.title = ttl + " " + D.t("ConsoleTitle");
    }
  },

  save: function(closewin, cb) {
    var me = this,
      form = me.view.down("form").getForm(),
      data = {};

    var sb1 = me.view.down("[action=save]"),
      sb2 = me.view.down("[action=apply]");

    if (sb1 && !!sb1.setDisabled) sb1.setDisabled(true);
    if (sb2 && !!sb2.setDisabled) sb2.setDisabled(true);

    if (form) {
      data = form.getValues();
    }

    var setButtonsStatus = function() {
      if (sb1 && !!sb1.setDisabled) sb1.setDisabled(false);
      if (sb2 && !!sb2.setDisabled) sb2.setDisabled(false);
    };

    if (me.view.fireEvent("beforesave", me.view, data) === false) {
      setButtonsStatus();
      return;
    }
    me.model.write(data, function(data, err) {
      if (
        data &&
        data.record &&
        data.record.signobject &&
        data.record.signobject.shouldSign
      )
        me.view.addSignButton(data.record.signobject);

      setButtonsStatus();
      if (err) {
        me.showErrorMessage(err); //win, err)
        return;
      }
      if (me.view.fireEvent("save", me.view, data) === false) {
        if (!!cb) cb(data);
        return;
      }
      if (closewin && !!me.view.close) me.view.close();

      if (!!cb) cb(data);
    });
  },

  showErrorMessage: function(err) {
    var me = this;
    err.forEach(function(item) {
      var el = me.view.down("[name=" + item.field + "]");
      if (el && !!el.setActiveError) {
        el.setActiveError(item.message);
      }
    });
  },

  setFieldsDisable: function(cb) {
    var me = this;

    me.model.getFields(function(fields) {
      fields.forEach(function(f) {
        //if(!f.visible)
        //    me.removeField(f.name)
        //else
        if (!f.editable) me.disableField(f.name);
      });
      cb();
    });
  },

  removeField: function(name) {
    var fld = this.view.down("[name=" + name + "]");
    if (fld && fld.ownerCt) fld.ownerCt.remove(fld);
  },

  disableField: function(name) {
    var fld = this.view.down("[name=" + name + "]");
    if (fld && !!fld.setReadOnly) fld.setReadOnly(true);
  },

  setFormReadOnly: function() {
    var f = function(elm) {
      if (elm) {
        if (!!elm.items) {
          elm.items.items.forEach(function(i) {
            f(i);
          });
        }
        if (!!elm.setReadOnly) elm.setReadOnly(true);
      }
    };
    f(this.view.down("form"));
  },

  download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/json;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  exportJson() {
    const data = this.view
      .down("form")
      .getForm()
      .getValues();
    delete data[this.model.idField];
    this.download(`${data.name}.json`, JSON.stringify(data));
  },

  importJson() {
    const file = this.view.down("[action=importjson]").fileInputEl.dom.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        let data;
        try {
          data = JSON.parse(evt.target.result);
        } catch (e) {}
        if (data) {
          this.view
            .down("form")
            .getForm()
            .setValues(data);
        } else {
          D.a("", "Data is not found in the file", [], () => {});
        }
      };
      reader.onerror = (evt) => {};
    }
  }
});
