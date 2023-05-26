/**
 * @author Max Tushev
 * @scope Server, Client
 * The model for Users Groups module
 * @private
 */
Ext.define("Crm.modules.users.model.GroupsModel", {
  extend: "Core.data.DataModel",

  collection: "groups",

  fields: [
    {
      name: "_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    /*{
        name: 'level',
        type: 'int',
        filterable: true,
        editable: true,
        visible: true
    },*/ {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "modelaccess",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "apiaccess",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "desktopclasname",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "autorun",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true,
      sort: -1
    },
    {
      name: "maker",
      type: "string",
      filterable: true,
      editable: false,
      visible: true,
      bindTo: {
        collection: "admin_users",
        keyFieldType: "ObjectID",
        keyField: "_id",
        fields: {
          login: 1,
          _id: 1
        }
      }
    },
  ],

  /**
   * @scope Client
   * @method
   * Getting accessible modules
   * @public
   */
  getModules: function(callback) {
    this.runOnServer("getModules", callback);
  },

  /**
   * @scope Server
   * @method
   * Getting accessible modules
   * read "model" dir in "modules" catalogue
   * @public
   */
  $getModules: function(data, callback) {
    var me = this,
      dirs = [],
      fs = me.getFs(),
      res = [];

    [
      function(call) {
        if (me.config.nameSpace)
          dirs.push({
            nameSpace: me.config.nameSpace + "-modules",
            dir: me.config.adminModulesDir
          });
        call();
      },

      function(call) {
        var fun = function(i) {
          if (i >= dirs.length) {
            callback(res);
            return;
          }
          fs.readdir(dirs[i].dir, function(e, models) {
            if (!models) {
              fun(i + 1);
              return;
            }
            var f = function(j) {
              if (j >= models.length) {
                fun(i + 1);
                return;
              }
              fs.readdir(dirs[i].dir + "/" + models[j] + "/model", function(
                e,
                files
              ) {
                if (!e && files) {
                  me.getModelnameFromFiles(
                    dirs[i].dir + "/" + models[j] + "/model",
                    files,
                    function(r) {
                      r.each(function(rr) {
                        res.push(rr);
                      });
                      f(j + 1);
                    }
                  );
                } else f(j + 1);
              });
            };
            f(0);
          });
        };
        fun(0);
      }
    ].runEach();
  },

  getModelnameFromFiles: function(dir, files, cb) {
    var me = this,
      res = [];
    var f = function(i) {
      if (i >= files.length) {
        cb(res);
        return;
      }
      me.getModelnameFromFile(dir + "/" + files[i], function(r) {
        if (r) res.push(r);
        f(i + 1);
      });
    };
    f(0);
  },

  getModelnameFromFile: function(path, cb) {
    this.getFs().readFile(path, function(e, d) {
      if (d) {
        d = d.toString();
        var i = 0,
          s = "";
        while (i < d.length && d.substr(i++, 10) != "Ext.define");
        i += 9;
        while (i < d.length && /[\(\)\s'"]/.test(d.charAt(i++)));
        i--;
        while (i < d.length && /[a-zA-Z0-9_\.]/.test(d.charAt(i)))
          s += d.charAt(i++);
        if (s) cb({ name: s.replace(/\./g, "-") });
        else cb();
      } else cb();
    });
  },
  /**
   * @scope Server
   * @method
   * Getting file system lib
   * @private
   */
  getFs: function() {
    if (!this.fs) this.fs = require("fs");
    return this.fs;
  },

  /* scope:client */
  getApiUrls: function(callback) {
    this.runOnServer("getApiUrls", callback);
  },

  /* scope:server */
  $getApiUrls: function(data, callback) {
    var me = this,
      out = [];

    me.config.routes.forEach(function(r) {
      if (r.name) out.push({ name: r.name });
    });
    callback(out);
  },

  /**
   * @scope: server
   * @Author: Vaibhav Mali
   * #Date: 23 May 2019.
   */
  /* scope:server */
  buildWhere: function(params, cb) {
    var me = this,
      args = arguments;
    me.find = { code: { $ne: "REALMS_MANAGERS" } };
    me.callParent(args);
  }
});
