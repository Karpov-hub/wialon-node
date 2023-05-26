/**
 * Server parent class for DataModel
 */

Ext.define("Core.data.TreeDataModel", {
  extend: "Core.data.DataModel",

  /**
   * @method
   * Getting module permissions
   * @public
   */
  //,$getPermissions: function(params, callback) {
  //    callback({read: true, add: true, modify: true, del: true})
  //}

  getData: function(params, callback) {
    var me = this,
      RootRecord;

    /*if(params._url) {
            me.getBranch(params._url, params, callback)
            return;
        };
        */

    [
      function(call) {
        if (!!me.beforeGetData) {
          me.beforeGetData(params, call);
        } else call();
      },
      function(call) {
        me.buildWhere(params, function(find) {
          me.fields.leaf = 1;
          call(find);
        });
      },

      function(find, call) {
        me.getReadableFields(params, function(fields) {
          fields.leaf = 1;
          call(find, fields);
        });
      },

      function(find, fields, call) {
        if (params.filters && params.filters.length) {
          call(find, fields);
          return;
        }

        if (params[me.idField]) params.id = params[me.idField];

        if (!params.id || params.id == "root") {
          find = {
            removed: { $ne: true },
            $or: [{ pid: false }, { pid: null }, { pid: { $exists: false } }]
          };
          call(find, fields);
          /*
                    me.src.db.collection(me.collection).findOne({root:true}, fields, function(e,data) {
                        if(data) {
                            find._id = data._id
                            RootRecord = data
                            call(find, fields);
                        } else callback(null, {code: 500, mess: 'Root node not found'})
                    })*/
        } else {
          find.pid = me.src.db.fieldTypes[me.fields[0].type].StringToValue(
            params.id
          );
          find.removed = { $ne: true };
          call(find, fields);
        }
      },

      function(find, fields, call) {
        if (me.find) {
          for (var i in me.find) {
            find[i] = me.find[i];
          }
        }
        if (RootRecord) {
          me.builData([RootRecord], function(data) {
            call(data);
          });
          return;
        }
        me.db.getData(
          me.collection,
          find,
          fields,
          { indx: 1 },
          null,
          null,
          function(total, data) {
            call(data);
          }
        );
      },

      function(data) {
        me.builData(data, function(data) {
          if (!Ext.isArray(data)) data = [data];
          callback({ list: data });
        });
      }
    ].runEach();
  },

  prepRecord: function() {
    arguments[0].id = arguments[0][this.idField];
    this.callParent(arguments);
  },

  beforeReorder: function(indexes, recs, sortField, callback) {
    callback(recs);
  },

  afterReorder: function(data, callback) {
    callback(data);
  },

  /**
   * @scope: Server
   * @method
   * Reordering items in the pages tree
   * @public
   */
  reorder: function(params, callback) {
    var me = this;

    [
      function(call) {
        if (params && params.indexes && params.recs) {
          call(params.indexes, params.recs);
        } else {
          callback(null);
        }
      },

      function(indexes, recs, call) {
        for (var i = 0; i < me.fields.length; i++) {
          if (me.fields[i].type == "sortfield") {
            call(indexes, recs, me.fields[i].name);
            return;
          }
        }
        callback(false);
      },

      function(indexes, recs, sortField, call) {
        me.beforeReorder(indexes, recs, sortField, function(recs) {
          if (recs) call(indexes, recs, sortField);
          else callback(null);
        });
      },

      function(indexes, recs, sortField, call) {
        var rootId,
          func = function(i) {
            if (i >= recs.length) {
              call(indexes, recs, sortField);
              return;
            }
            var id = me.src.db.fieldTypes.ObjectID.StringToValue(
                recs[i] ? recs[i][me.idField] : ""
              ),
              pid = me.src.db.fieldTypes.ObjectID.StringToValue(
                recs[i].pid ? recs[i].pid : ""
              );

            if (!pid) pid = rootId;
            if (id && pid) {
              var oo = {};
              oo[me.idField] = id;
              me.src.db
                .collection(me.collection)
                .updateOne(oo, { $set: { pid: pid } }, function(e, d, qr) {
                  func(i + 1);
                });
            } else {
              callback(null);
            }
          };
        var oo = {};
        oo[me.idField] = 1;
        me.src.db
          .collection(me.collection)
          .findOne({ root: true }, oo, function(e, d) {
            if (d) {
              rootId = d[me.idField];
              func(0);
            } else callback(null);
          });
      },

      function(indexes, recs, sortField, call) {
        var id,
          set,
          keys = [],
          i;
        for (i in indexes) keys.push(i);
        i = 0;
        var f = function() {
          if (i >= keys.length) {
            call(indexes, recs, sortField);
            return;
          }
          id = me.src.db.fieldTypes.ObjectID.StringToValue(keys[i]);
          if (id) {
            set = {};
            set[sortField] = indexes[keys[i]];
            var oo = {};
            oo[me.idField] = id;
            me.src.db
              .collection(me.collection)
              .updateOne(oo, { $set: set }, function(e, d, qr) {
                i++;
                f();
              });
          } else {
            i++;
            f();
          }
        };
        f();
      },
      function(indexes, recs, sortField, call) {
        recs.each(function(d) {
          if (indexes[d[me.idField] + ""])
            d[sortField] = indexes[d[me.idField] + ""];
          return d;
        }, true);
        call(recs);
      },
      function(data) {
        me.afterReorder(data, function(data) {
          if (data) callback({ success: true, data: data });
          else callback(null);
        });
      }
    ].runEach();
  },

  $remove: function(data, callback) {
    var me = this;
    me.getPermissions(function(permis) {
      if (permis.del) me.removeRecur(data.records, callback);
      else me.error(401);
    });
  },

  removeRecur: function(data, cb) {
    var me = this;
    me.noChangeLog = true;
    var i = 0,
      f = function() {
        if (i >= data.length) {
          me.noChangeLog = false;
          cb({ success: true });
          me.changeModelData(
            Object.getPrototypeOf(me).$className,
            "remove",
            data
          );
          return;
        }
        me.removeRecurOne(data[i], function() {
          i++;
          f();
        });
      };
    f();
  },

  removeRecurOne: function(id, cb) {
    var me = this,
      db = me.src.db;

    [
      function(next) {
        var pid = me.db.fieldTypes.ObjectID.getValueToSave(me, id);
        if (pid) {
          var oo = {};
          oo[me.idField] = 1;
          db.collection(me.collection)
            .find({ pid: pid }, oo)
            .toArray(function(e, d) {
              if (d && d.length) {
                var ids = [];
                d.each(function(r) {
                  ids.push(r[me.idField] + "");
                });
                me.removeRecur(ids, function() {
                  next();
                });
              } else next();
            });
        } else cb();
      },
      function(next) {
        me.remove([id], function() {
          cb();
        });
      }
    ].runEach();
  },

  changeModelData: function(modelName, act, ids) {
    if (act == "remove") {
      if (this.noChangeLog) return;
    }
    this.callParent(arguments);
  },

  $remove: function(data, callback) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.del) me.removeNodes(data.records, callback);
        else me.error(401);
      },
      null,
      data
    );
  },

  removeNodes: function(ids, cb) {
    var me = this;
    ids.each(function(i) {
      return me.db.fieldTypes[me.fields[0].type].getValueToSave(me, i);
    }, true);
    var oo = {};
    oo[me.idField] = 1;
    me.dbCollection.find({ pid: { $in: ids } }, oo).toArray(function(e, d) {
      if (d && d.length) {
        d.each(function(i) {
          return i[me.idField];
        }, true);
        me.removeNodes(d, function() {
          me.remove(ids, cb);
        });
      } else {
        me.remove(ids, cb);
      }
    });
  },

  getBranch: function(id, params, callback) {
    var me = this,
      out = [];

    id = me.db.fieldTypes[me.fields[0].type].getValueToSave(me, id);
    var f = function(id, cb) {
      var oo = {};
      oo[me.idField] = id;
      oo.removed = { $ne: true };
      me.dbCollection.findOne(oo, { pid: 1 }, function(e, d) {
        me.getData(
          {
            filters: [{ property: "pid", value: d.pid + "" }]
          },
          function(res) {
            out.push({ pid: d.pid, list: res.list });
            if (d.pid) f(d.pid, cb);
            else cb();
          }
        );
      });
    };
    f(id, function() {
      var list = me.buildBranch(out, out.length - 1);
      callback({ total: list.length, list: list });
    });
  },

  buildBranch: function(data, l) {
    var out = [],
      chld;
    if (l < 0) return null;
    for (var i = 0; i < data[l].list.length; i++) {
      if (l > 0) {
        if (data[l].list[i][this.idField] + "" == data[l - 1].pid + "") {
          chld = this.buildBranch(data, l - 1);
          if (chld && chld.length) {
            data[l].list[i].children = chld;
            data[l].list[i].expanded = true;
          }
        }
      }
      out.push(data[l].list[i]);
    }
    return out;
  },

  $getPids: function(params, callback) {
    var me = this,
      out = [];

    id = me.db.fieldTypes[me.fields[0].type].getValueToSave(
      me,
      params[me.idField]
    );
    var f = function(id, cb) {
      var oo = {};
      oo[me.idField] = id;
      oo.removed = { $ne: true };
      me.dbCollection.findOne(oo, { pid: 1 }, function(e, d) {
        if (d && d.pid) {
          out.push(d.pid);
          f(d.pid, cb);
        } else cb();
      });
    };
    f(id, function() {
      callback({ pids: out });
    });
  }
});
