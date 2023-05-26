Ext.define("Admin.store.NavigationTree", {
  extend: "Ext.data.TreeStore",

  storeId: "NavigationTree",
  root: {
    expanded: true,
    children: []
  },
  fields: [
    {
      name: "text"
    }
  ],

  constructor: function() {
    this.readModules();
    this.callParent(arguments);
  },

  readModules: function() {
    if (!Glob.ws) {
      setTimeout(() => {
        this.readModules();
      }, 100);
      return;
    }

    this.modelsToWatch = [];

    Ext.create("Crm.modules.users.model.UsersModel").getUserModels(
      (permiss) => {
        this.makePermissions(permiss);
        var i = 0;
        __CONFIG__.NavigationTree.forEach((node) => {
          var x = this.buildItemNode(node);
          if (x) {
            this.root.insertChild(i++, x);
          }
        });

        this.subscribeToCounters();
      }
    );
  },

  getModelCount(model) {
    setTimeout(() => {
      model.getCount((data) => {
        this.setCounterLabel({
          text: data.count,
          class: data.class || "counter",
          model: data.model || Object.getPrototypeOf(model).$className
        });
        this.getModelCount(model);
      });
    }, 5000);
  },

  subscribeToCounters() {
    this.modelsToWatch.forEach((modelName) => {
      let model;
      try {
        model = Ext.create(modelName);
      } catch (e) {}
      if (!!model && !!model.getCount) {
        this.getModelCount(model);
        Glob.ws.subscribe(modelName, modelName, (action, data) => {
          this.getModelCount(model);
        });
      }
    });
  },

  setCounterLabel(data) {
    this.each((item) => {
      let log = false;
      let view;
      if (item.data.model == data.model) {
        item.data.text = this.setNavText(item.data.text, data, item.data.view);
        view = item.data.view;
        log = true;
      } else if (item.childNodes && item.childNodes.length) {
        item.childNodes.forEach((citem) => {
          if (citem.data.model == data.model) {
            citem.data.text = this.setNavText(
              citem.data.text,
              data,
              citem.data.view
            );
            view = citem.data.view;
            citem.commit();
            log = true;
          }
        });
        if (log) item.data.text = this.setNavText(item.data.text, data, view);
      }
      if (log) item.commit();
    });
  },

  setNavText(oldText, data, view) {
    let s = oldText.split(
      new RegExp(
        `<a onclick="location='#[^"]{1,}'" class="${data.class}">[^<]{0,}<\\/a>`
      )
    );
    return data.text && data.text !== "0"
      ? `<a onclick="location='#${view}'" class="${data.class}">${
          data.text
        }</a>${s[0]}${s[1] ? s[1] : ""}`
      : s.join("");
  },

  makePermissions: function(permiss) {
    if (permiss.superuser) this.permissions = true;
    else {
      this.permissions = {};
      for (var i in permiss.permissions) {
        this.permissions[
          i
            .replace(/-/g, ".")
            .replace(".model.", ".view.")
            .replace(/Model$/, "")
        ] = permiss.permissions[i];
      }
    }
  },

  checkPermission: function(view) {
    if (this.permissions === true) return true;
    var perm = this.permissions[view] || null;
    if (!perm) perm = this.permissions[view.substr(0, view.length - 4)];
    if (perm) {
      for (var i in perm) if (perm[i]) return true;
    }
    return false;
  },

  buildItemNode: function(item) {
    var me = this,
      out = {
        text: D.t(item.text),
        leaf: !(item.children && item.children.length),
        iconCls: item.iconCls,
        rowCls: item.rowCls
      };
    if (item.model) {
      out.model = item.model;
    }
    if (item.view) {
      if (!me.checkPermission(item.view)) {
        return null;
      }
      out.view = item.view;
      out.routeId = item.view;
      out.withoutHashChange = !!item.withoutHashChange;
      if (!out.model) {
        out.model =
          item.view
            .replace(".view.", ".model.")
            .substr(0, item.view.length - 3) + "Model";
      }
    }

    if (out.model && !this.modelsToWatch.includes(out.model)) {
      this.modelsToWatch.push(out.model);
    }

    if (item.children && item.children.length) {
      out.children = [];
      item.children.forEach(function(itm) {
        var x = me.buildItemNode(itm);
        if (x) out.children.push(x);
      });
      if (!out.children.length) return null;
    }
    return out;
  }
});
