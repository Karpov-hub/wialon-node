/**
 * @class Core.data.DataModel
 * @extend Core.AbstractModel
 *
 * Server
 *
 *
 * Server side data model
 */

/*
var excelbuilder = require('msexcel-builder'),
    crypto = require('crypto'),
    BSON = require('bson').pure().BSON;
 */
Ext.define("Core.data.DataModel", {
  extend: "Core.AbstractModel",

  mixins: [
    "Core.data.actions.Read",
    "Core.data.actions.Write",
    "Core.data.actions.Remove",
    "Core.data.actions.Copy",
    "Core.data.actions.Reorder",
    "Core.data.actions.Import",
    "Core.data.actions.Export",
    "Core.data.actions.Sign"
  ],

  requires: [
    "Ext.data.validator.Validator"
    //'Ext.data.Validation'
  ],
  uses: ["Ext.data.Validation"],

  maxLimit: 500,

  idField: "_id",

  isNeedSendSigMessage: true,

  constructor: function(cfg) {
    var me = this;

    if (cfg) {
      if (cfg.skipInit) {
        me.callParent(arguments);
        return;
      }

      if (me.dbType && cfg.src[me.dbType]) {
        me.db = cfg.src[me.dbType];
      } else if (cfg.src && cfg.src.db) {
        me.db = cfg.src.db;
        if (me.collection)
          me.dbCollection = cfg.src.db.collection(me.collection);
      }

      // if (!me.notCheckCollection && cfg && cfg.config && cfg.config.debug) {
      // me.db.checkCollection(me);
      // }

      if (cfg.xPermissions) me.accessSet = cfg.xPermissions;
    }
    me.callParent(arguments);
  },

  getFieldByName: function(name) {
    for (var i = 0; i < this.fields.length; i++) {
      if (this.fields[i].name == name) return this.fields[i];
    }
    return null;
  },

  setTx: function(tx) {
    this.db = tx;

    this.dbCollection = tx.collection(this.collection);
  },

  /**
   * @method
   * Server method
   *
   * Sending changed model data to a websocket
   * @param {String} modelName
   * @param {String} eventName
   * @param {Object} data
   * @private
   */
  changeModelData: function(modelName, event, data, conn) {
    if (this.noChangeModel) return;

    if (!modelName) modelName = Object.getPrototypeOf(this).$className;

    var me = this;

    [
      function(next) {
        me.beforeChangeModelData(data, event, function(data) {
          next(data);
        });
      },

      function(data) {
        var params = {
            model: modelName,
            event: event,
            data: data
          },
          mdlStr = modelName.replace(/\./g, "-"),
          jdata,
          bdata;

        for (var i in me.src.wsConnections) {
          if (
            me.src.wsConnections[i].sUser ||
            (me.src.wsConnections[i].permis &&
              me.src.wsConnections[i].permis[mdlStr] &&
              me.src.wsConnections[i].permis[mdlStr].read)
          ) {
            for (var j = 0; j < me.src.wsConnections[i].conns.length; j++) {
              if (
                me.src.wsConnections[i].conns[j] != conn &&
                me.isNeedWsSync(me.src.wsConnections[i].conns[j], params, i)
              ) {
                if (me.src.wsConnections[i].conns[j].isServer) {
                  if (!bdata) bdata = BSON.serialize(params);
                  me.src.wsConnections[i].conns[j].send(bdata);
                } else {
                  if (!jdata) jdata = JSON.stringify(params);
                  me.src.wsConnections[i].conns[j].sendUTF(jdata);
                }
              }
            }
          }
        }
      }
    ].runEach();
  },

  beforeChangeModelData: function(data, event, cb) {
    cb(data);
  },

  isNeedWsSync: function(conn, params, user_id) {
    return true;
  },

  /**
   * @method
   * @private
   * Server and client method
   *
   * Getting permissions of a current model
   * @param {Function} callback
   */
  getPermissions: function(p1, p2, p3) {
    let callback;
    if (Ext.isFunction(p1)) callback = p1;
    if (!!callback) {
      return this.getPermissions_do(p1, p2, p3);
    }
    return new Promise((resolve, reject) => {
      this.getPermissions_do(
        res => {
          resolve(res);
        },
        p1,
        p2
      );
    });
  },

  getPermissions_do: function(callback, mn, data) {
    var me = this;

    if (!mn) mn = me.getShortName();

    [
      function(call) {
        if (!me.user)
          callback({ read: false, add: false, modify: false, del: false });
        else call();
      },

      function(call) {
        me.callModel(
          "Admin.model.User.getUserAccessRates",
          { auth: me.user.id },
          function(permis) {
            if (permis) call(permis);
            else
              callback({ read: false, add: false, modify: false, del: false });
          }
        );
      },

      function(permis, call) {
        if (permis.superuser)
          // superuser cans all
          callback({
            read: true,
            add: true,
            modify: true,
            del: true,
            ext: true
          });
        else call(permis);
      },

      function(permis) {
        if (permis && permis.modelaccess && permis.modelaccess[mn])
          callback(permis.modelaccess[mn]);
        else callback({ read: false, add: false, modify: false, del: false });
      }
    ].runEach();
  },

  /**
   * @method
   * Server method
   *
   * Getting module permissions
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $getPermissions: function(params, callback) {
    this.getPermissions(callback, null, params);
  },

  /**
   * @method
   * Server method
   *
   * Creating new ObjectId
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $getNewObjectId: function(data, cb) {
    if (!!this.src.db.createObjectId) this.src.db.createObjectId(cb);
    else cb("");
  },

  wsEvent_ins: function(conn, data, cb) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (data[me.idField] && permis.add) {
          me.upsertData(data, function() {
            me.changeModelData(
              Object.getPrototypeOf(me).$className,
              "ins",
              data,
              conn
            );
            cb();
          });
        }
      },
      null,
      data
    );
  },

  wsEvent_upd: function(conn, data, cb) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (data[me.idField] && permis.modify) {
          me.upsertData(data, function() {
            me.changeModelData(
              Object.getPrototypeOf(me).$className,
              "upd",
              data,
              conn
            );
            cb();
          });
        }
      },
      null,
      data
    );
  },

  wsEvent_remove: function(conn, data, cb) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.del)
          me.removeData(data, function() {
            me.changeModelData(
              Object.getPrototypeOf(me).$className,
              "remove",
              data,
              conn
            );
            cb();
          });
        else me.error(401);
      },
      null,
      data
    );
  },

  upsertData: function(data, cb) {
    data = this.setModifyTime(data);
    var oo = {};
    oo[this.idField] = data[this.idField];
    this.src.db
      .collection(this.collection)
      .updateOne(oo, data, { upsert: true }, cb);
  },

  removeData: function(data, cb) {
    var me = this,
      set = me.setModifyTime({ removed: true });
    data.eachCb(function(id, next) {
      var oo = {};
      oo[me.idField] = id;
      me.src.db.collection(me.collection).updateOne(oo, { $set: set }, next);
    }, cb);
  },

  setModifyTime: function(data) {
    return data;
    if (syncServerTime || !this.config.authoriz) {
      // socket connect OK
      data.stime = new Date().getTime() - syncServerTime;
      data.ltime = null;
    } else {
      data.ltime = new Date().getTime();
      data.stime = null;
    }
    return data;
  },

  syncData: function(servCb, cb) {
    var me = this;
    if (!this.collection) {
      cb();
      return;
    }

    var cursor = me.src.db
      .collection(me.collection)
      .find({ ltime: { $ne: null } }, {});
    me.syncDataNextRecord(cursor, servCb, function() {
      me.changeModelData(Object.getPrototypeOf(me).$className, "ins", {});
      cb();
    });
  },

  syncDataNextRecord: function(cursor, servCb, cb) {
    var me = this;
    cursor.nextObject(function(e, d) {
      if (!d) {
        cb();
        return;
      }
      me.syncDataProcRecord(d, servCb, function() {
        me.syncDataNextRecord(cursor, servCb, cb);
      });
    });
  },

  syncDataProcRecord: function(data, servCb, cb) {
    var me = this;
    servCb({ collection: me.collection, data: data }, function(res) {
      if (res && res.success && res.stime) {
        var oo = {};
        oo[me.idField] = data[me.idField];
        me.src.db
          .collection(me.collection)
          .updateOne(
            oo,
            { $set: { ltime: null, stime: res.stime } },
            function() {
              cb();
            }
          );
      }
    });
  },

  syncDataFromServer: function(data, cb) {
    return cb(data);
    var me = this;

    [
      function(next) {
        me.onBeforeSyncDataFromServer(data, next);
      },

      function(data, next) {
        var oo = {};
        oo[me.idField] = data[me.idField];
        me.src.db
          .collection(me.collection)
          .findOne(oo, { ltime: 1 }, function(e, d) {
            if (d) {
              if (!d.ltime || d.ltime - syncServerTime < data.stime) {
                me.syncDataFromServerUpdate(data, cb);
              } else {
                cb({});
              }
            } else {
              me.syncDataFromServerInsert(data, cb);
            }
          });
      }
    ].runEach();
  },

  syncDataFromServerUpdate: function(data, cb) {
    var me = this;
    data.ltime = null;
    var set = {};
    for (var i in data) if (i != me.idField) set[i] = data[i];
    var oo = {};
    oo[me.idField] = data[me.idField];
    me.src.db
      .collection(me.collection)
      .updateOne(oo, { $set: set }, function(e, d) {
        me.onAfterSyncDataFromServer(set, "upd", cb);
      });
  },

  syncDataFromServerInsert: function(data, cb) {
    var me = this;
    data.ltime = null;
    me.src.db.collection(me.collection).insert(data, function(e, d) {
      me.onAfterSyncDataFromServer(d[0], "ins", cb);
    });
  },

  onBeforeSyncDataFromServer: function(data, cb) {
    cb(data);
  },

  onAfterSyncDataFromServer: function(data, action, cb) {
    cb({});
  },

  getSequence: function(name, cb) {
    var me = this;

    me.src.db
      .collection("sequences")
      .findAndModify({ name: name }, {}, { $inc: { value: 1 } }, {}, function(
        e,
        d
      ) {
        cb(d ? d.value : "");
      });
  },

  /**
   * Validates the current data against all of its configured {@link #validations}.
   * @return {Ext.data.Errors} The errors object
   */
  validate: function(data) {
    var errors = { items: [], isValid: true },
      validations = this.validations,
      length,
      validation,
      field,
      valid,
      type,
      i;

    if (validations) {
      length = validations.length;
      for (i = 0; i < length; i++) {
        validation = validations[i];
        field = validation.field || validation.name;
        type = validation.type;
        valid = Ext.create("Ext.data.validator." + type, validation).validate(
          data[field]
        );
        if (valid !== true) {
          errors.isValid = false;
          errors.items.push({
            field: field,
            message: valid
          });
        }
      }
    }
    return errors;
  },

  /**
   * Checks if the model is valid. See {@link #validate}.
   * @return {Boolean} True if the model is valid.
   */
  isValid: function(data) {
    if (this.validations) {
      var res = this.validate(data);
      if (res.isValid) return true;
      return res.items;
    }
    return true;
  },

  error: function(code, mess) {
    if (!this.response) {
      console.log("Error #", code, ": ", mess);
      return;
    }
    var headers = {},
      http_codes = require("janusjs-http_codes"),
      text = "";
    headers["Content-Type"] = "application/json;utf-8";
    if (http_codes.httpCodes[code]) {
      text = http_codes.httpCodes[code];
    }
    var result = JSON.stringify({
      error: code,
      message: mess || text
    });
    headers["Content-Length"] = Buffer.byteLength(result, "utf8");
    this.response.writeHead(code, text, headers);
    this.response.end(result);
  },

  $getFields: function(data, cb) {
    var me = this;
    this.getPermissions(function(perm) {
      if (perm) {
        if (perm.ext === true) cb(me.fields);
        else {
          var fields = [];
          me.fields.forEach(function(f) {
            if (perm.ext && perm.ext[f.name]) {
              f.editable = f.editable ? perm.ext[f.name].editable : false;
              f.visible = f.visible ? perm.ext[f.name].visible : false;
            }
            fields.push(f);
          });
          cb(fields);
        }
      } else cb([]);
    });
  }
});
