/**
 * @class Core.data.DataModel
 *
 *
 * Main data model class for admin modules. Client side path of the class is an extend of  {@link Ext.data.Model}.
 * Server side path is an extend of {@link Core.AbstractModel}.
 *
 *     @example
 *     Ext.define('MyProjectNamespace.mymodule.model.mymoduleModel', {
 *         extend: 'Core.data.DataModel',
 *
 *         // Collection name
 *         collection: 'news', // scope:server
 *         // remove or mark
 *         removeAction: 'remove', // scope:server
 *         // for search indexer texts templates
 *         searchCfg: {
 *             titleTpl: '{title}',
 *             descriptTpl: '<tpl if="text">{[values.text.replace(/(<([^>]+)>)/ig," ")]}</tpl>',
 *             indexFields: ['date_start']
 *         },
 *
 *         fields: [{
 *             name: '_id',
 *             type: 'ObjectID',
 *             visible: true
 *         },{
 *             name: 'title',
 *             type: 'string',
 *             filterable: true,
 *             editable: true,
 *             visible: true
 *         },{
 *             name: 'stext',
 *             type: 'string',
 *             filterable: false,
 *             editable: true,
 *             visible: true
 *         },{
 *             name: 'text',
 *             type: 'string',
 *             filterable: false,
 *             editable: true,
 *             visible: true
 *         },{
 *             name: 'publ',
 *             type: 'boolean',
 *             filterable: true,
 *             editable: true,
 *             visible: true
 *         },{
 *             name: 'ctime',
 *             type: 'date',
 *             sort: -1,
 *             filterable: true,
 *             editable: false,
 *             visible: true
 *         }],
 *         // validation rules.
 *         // type is one of Ext.data.validator (Bound, Email, Exclusion, Format, Inclusion, Length, Presence, Range)
 *         validations: [
 *             {type: 'Presence',  field: 'title'},
 *             {type: 'Length',    field: 'title', min: 10},
 *             {type: 'Presence',  field: 'stext'}
 *         ]
 *     })
 *
 *     You can call client and server methods in one model:
 *
 *     @example
 *     Ext.define('MyProjectNamespace.mymodule.model.mymoduleModel', {
 *         extend: 'Core.data.DataModel',
 *
 *         .....
 *
 *         // Client method calls server method
 *         myMethod: function(data, callback) {
 *             // your actions on server side
 *             // here you can use methods of server side path of Core.data.DataModel
 *             this.runOnServer('myMethod', data, callback)
 *         },
 *
 *         // Server method that called by client method
 *         $myMethod: function(data, callback) {
 *             // your actions on server side
 *             // here you can use methods of server side path of Core.data.DataModel
 *
 *             callback(result)
 *         }
 *     })
 *
 */
Ext.define("Core.data.DataModel", {
  extend: "Ext.app.ViewModel", //'Core.data.Model'

  idField: "_id",

  constructor: function(cfg) {
    if (this.xPermissions) this.accessSet = this.xPermissions;
    if (cfg && cfg.recordId) {
      this.onRecordUpdateSubscribe(this.recordId);
    }
    this.callParent(arguments);
  },

  /**
   * @method
   * Client method
   *
   * Run method on server model
   * @param {String} action
   * @param {Object} data optional
   * @param {Function} callback optional
   * @private
   */
  runOnServer: function(action, p1, p2) {
    var me = this,
      req = {
        model: Object.getPrototypeOf(me).$className,
        action: action
      },
      cb;
    if (Ext.isFunction(p1)) cb = p1;
    else if (p1) {
      for (var i in p1) req[i] = p1[i];
    }
    if (!cb && !!p2) cb = p2;
    Glob.ws.request(req, function(data) {
      if (!!cb) cb(data);
    });
  },

  /**
   * @method
   * Getting user permissions from server side
   */
  getPermissions: function(callback, nm, data) {
    this.runOnServer("getPermissions", data, callback);
  },

  /**
   * @method
   * Client method
   *
   * Getting one record
   * @param {String} id
   * @param {Function} callback
   *
   */
  readRecord: function(id, callback) {
    this.runOnServer(
      "read",
      { filters: [{ property: this.idField, value: id }] },
      function(data) {
        var res = {};
        if (data && data.list && data.list[0]) {
          res = data.list[0];
        }
        callback(res);
      }
    );
  },

  /**
   * @method
   * Client method
   *
   * Getting all records
   * @param {Function} callbacl
   * @param {Object} params
   *
   */
  readAll: function(callback, params) {
    if (!params) params = params;
    this.runOnServer("read", params, callback);
  },

  /**
   * @method
   * Sanding data to server to save.
   * @param {Object} data
   * @param {Function} callback
   */
  write: function(data, callback) {
    var validateResult = this.isValid(data);
    if (
      validateResult === true ||
      (!!validateResult.isValid && validateResult.isValid())
    ) {
      if (localStorage.getItem("uid")) {
        data._admin_id = localStorage.getItem("uid");
      }
      this.runOnServer("write", data, callback);
    } else callback(null, validateResult.items);
  },

  /**
   * @method
   * Copying data.
   * @param {String} id
   * @param {Function} callback
   */
  copy: function(id, callback) {
    var oo = {};
    oo[this.idField] = id;
    this.runOnServer("copy", oo, callback);
  },
  /**
   * @method
   * Removeing records.
   * @param {Object} data
   * @param {Function} callback
   */
  remove: function(data, callback) {
    this.runOnServer("remove", { records: data }, callback);
  },
  /**
   * @method
   * Getting unique ObjectId.
   * @param {Function} callback
   */
  getNewObjectId: function(cb) {
    this.runOnServer("getNewObjectId", {}, cb);
  },

  /**
   * @method
   * Downloading export file.
   * @param {Object} filters
   */
  exportData: function(filters, fields) {
    var me = this,
      filt = [];
    if (filters && filters.items && filters.items.length) {
      for (var i = 0; i < filters.items.length; i++) {
        filt.push({
          _operator: filters.items[i].operator || filters.items[i]._operator,
          _property: filters.items[i].property || filters.items[i]._property,
          _type: filters.items[i].type || filters.items[i]._type,
          _value: filters.items[i].value || filters.items[i]._value
        });
      }
    }

    var p = { filters: filt };
    if (fields) p.fieldSet = fields;

    document.getElementById("loadDiv").style.display = "";

    me.runOnServer("exportData", p, function(data) {
      document.getElementById("loadDiv").style.display = "none";
      if (data && data.file)
        location =
          "/Admin.Data.getXls/?file=" +
          encodeURIComponent(data.file) +
          "&name=" +
          me.collection +
          ".xlsx";
    });
  },
  /**
   * @method
   * Importing one record.
   * @param {Array} rec array with imported data
   */
  importCsvLine: function(rec, cb) {
    var me = this,
      data = {},
      log = false;
    for (var i = 1; i < me.fields.items.length; i++) {
      if (me.fields.items[i] && rec[i - 1] != undefined && rec[i - 1] != null) {
        data[me.fields.items[i].name] = rec[i - 1];
        log = true;
      }
    }
    if (log) {
      data.noChangeModel = true;
      me.write(data, cb);
    } else cb();
  },

  /**
   * Validates the current data against all of its configured {@link #validations}.
   * @return {Ext.data.Errors} The errors object
   */
  validate: function(data) {
    var errors = new Ext.data.Errors(),
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
          errors.add({
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
      return res;
    }
    return true;
  },

  onRecordUpdateSubscribe: function() {
    var me = this,
      name = Object.getPrototypeOf(me).$className;
    Glob.ws.subscribe(name, name, function(action, data) {
      if (data && me.recordId == data[me.idField] && action == "upd")
        me.onRecordUpdate(data);
    });
  },
  onRecordUpdate: function(data) {
    this.set("data", data);
  },

  importDataFromFile: function(data, cb) {
    const modelName = Object.getPrototypeOf(this).$className;

    setTimeout(() => {
      Ext.MessageBox.show({
        title: D.t("Wait"),
        msg: D.t("Importing data..."),
        progressText: D.t("Data being processed..."),
        width: 300,
        progress: true,
        closable: false
      });
    }, 100);

    Glob.ws.subscribe(modelName, modelName, (action, data) => {
      if (action == "progress") {
        Ext.MessageBox.updateProgress(
          data.progress / 100,
          data.progress + "% (lines: " + data.line + ")"
        );
      }
    });

    this.runOnServer("importDataFromFile", data, function(res) {
      Ext.MessageBox.hide();
      if (!!cb) cb(res);
    });
  },

  getFields: function(cb) {
    this.runOnServer("getFields", {}, cb);
  },

  signRecord: function(id, cb) {
    var oo = {};
    oo[this.idField] = id;
    this.runOnServer("signRecord", oo, cb);

    //cb({success: true})
  },

  unSignRecord: function(id, note, cb) {
    var oo = { note: note };
    oo[this.idField] = id;
    this.runOnServer("unSignRecord", oo, cb);
    //cb({success: true})
  }
});
