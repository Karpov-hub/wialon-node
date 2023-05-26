Ext.define("Core.data.actions.Read", {
  /**
   * @method
   * Server method
   *
   * Alias for private method getData with checking access rights
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $read: function(data, cb) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.read) {
          me.getDataAndCheckSign(data, function(res) {
            cb(res);
          });
        } else {
          me.error(401);
        }
      },
      null,
      data
    );
  },

  getDataAndCheckSign: function(data, cb) {
    var me = this;

    me.getData(data, function(res) {
      me.isNeedSign(function(r) {
        if (r) me.checkSignObject(res, r);
        cb(res);
      }, res.list);
    });
  },

  $readRecord: function(param, cb) {
    var filters = [];
    Object.keys(param).forEach(k => {
      filters.push({ property: "_id", value: param._id });
    });

    var f = data => {
      if (!!this.afterReadRecord) this.afterReadRecord(data, cb);
      else cb(data);
    };
    this.$read({ filters: filters }, res => {
      if (res && res.list && res.list[0]) {
        f(res.list[0]);
      } else {
        f({});
      }
    });
  },

  /**
   * @method
   * Server method.
   *
   * Create find object
   * @param {Object} params request params
   * @param {Function} callback
   *
   */
  buildWhere: function(params, callback) {
    this.db.buildWhere(params, this, callback);
  },

  /**
   * @method
   * Server method
   *
   * Getting readable fields for the request
   * @param {Object} params request params
   * @param {Function} callback
   *
   */
  getReadableFields: function(params, callback) {
    var me = this,
      fields = {},
      queryFieldSet;
    if (params) {
      if (params.fieldSet) {
        if (Ext.isString(params.fieldSet))
          queryFieldSet = params.fieldSet.split(",");
        else queryFieldSet = params.fieldSet;
      }
    }
    me.fields.each(function(field) {
      if (field.visible) {
        if (!queryFieldSet || queryFieldSet.indexOf(field.name) != -1) {
          if (field.mapping) fields[field.mapping] = 1;
          else fields[field.name] = 1;
        }
      }
    });
    fields[me.idField] = 1;
    callback(fields);
  },

  /**
   * @method
   * Server method
   *
   * Build object for results sorting
   * @param {Object} params request params
   * @param {Function} callback
   *
   */
  buildSort: function(params, callback) {
    var me = this,
      sr,
      sort = {};
    if (
      params.sorters &&
      Ext.isArray(params.sorters) &&
      params.sorters.length
    ) {
      for (var i = 0; i < me.fields.length; i++) {
        for (var j = 0; j < params.sorters.length; j++) {
          sr = params.sorters[j]._property
            ? {
                property: params.sorters[j]._property,
                direction: params.sorters[j]._direction
              }
            : params.sorters[j];
          if (sr.property == me.fields[i].name) {
            sort[me.fields[i].name] = sr.direction == "ASC" ? 1 : -1;
          }
        }
      }
    } else if (params.sort) {
      if (typeof params.sort === "object") {
        for (var i = 0; i < me.fields.length; i++) {
          if (params.sort[me.fields[i].name]) {
            sort[me.fields[i].name] = params.sort[me.fields[i].name];
          }
        }
      } else {
        if (typeof params.sort !== "function") {
          sort[params.sort] = !!params.dir && params.dir == "ASC" ? 1 : -1;
        }
      }
    } else {
      for (var i = 0; i < me.fields.length; i++) {
        if (me.fields[i].sort) {
          sort[me.fields[i].name] = me.fields[i].sort;
        }
      }
    }

    callback(sort);
  },

  /**
   * @method
   * Server method
   *
   * Getting results limits
   * @param {Object} params request params
   * @param {Function} callback
   *
   */
  buildLimits: function(params, callback) {
    var start = params.start || 0,
      limit = params.limit || 200;

    start = parseInt(start);
    limit = parseInt(limit);
    if (isNaN(start)) start = 0;
    if (isNaN(limit)) limit = 200;

    if (limit > this.maxLimit) limit = this.maxLimit;

    callback(start, limit);
  },

  /**
   * @method
   * Server method
   *
   * Preparing found data
   * @param {Object} data list of result records
   * @private
   */
  builData: function(data, callback, fields, params) {
    var me = this,
      i = 0;

    if (!data) {
      callback(data);
      return;
    }

    var func = function() {
      if (i >= data.length) {
        callback(data);
        return;
      }
      me.prepRecord(data[i], function(rec) {
        data[i] = rec;

        i++;
        func(i);
      });
    };

    if (me.removeBindTo(params)) {
      func();
      return;
    }

    [
      function(next) {
        me.fields.each(function(r) {
          if ((!fields || fields[r.name]) && r.bindTo) {
            if (!me.binds) me.binds = {};
            me.binds[r.name] = r.bindTo;
          }
        });
        next();
      },

      function(next) {
        if (me.binds) next();
        else func();
      },

      function(next) {
        me.bindsKeys = {};
        data.each(function(r) {
          for (var i in r) {
            if (me.binds[i]) {
              //Vaibhav Vaidya, 24 May 2018, Skip bind condition if data value is undefined
              if (r[i] != undefined && !me.bindsKeys[i]) me.bindsKeys[i] = {};
              if (r[i] != undefined && !me.bindsKeys[i][r[i]])
                me.bindsKeys[i][r[i]] = r[i];
              //Vaibhav Vaidya, end edit of skip bind condition
            }
          }
        });
        next();
      },

      function(next) {
        Object.keys(me.binds).prepEach(
          (key, nxt) => {
            if (me.binds[key] != undefined && me.bindsKeys[key] != undefined) {
              me.getBindValues(me.binds[key], me.bindsKeys[key], function(d) {
                if (d) me.binds[key] = d;
                nxt();
              });
            } else {
              nxt();
            }
          },
          () => {
            func();
          }
        );
      }
    ].runEach();
  },

  removeBindTo: function(params) {
    this.isBinded = !(
      params &&
      params.filters &&
      params.filters.length == 1 &&
      params.filters[0] &&
      params.filters[0].property &&
      params.filters[0].property == this.isField
    );

    return !this.isBinded;
  },

  getBindValues: function(sets, keys, cb) {
    if (!keys || !sets || !sets.keyField) {
      cb();
      return;
    }

    var k,
      find = {},
      ids = [];

    Object.keys(keys).forEach(i => {
      if (Ext.isArray(keys[i])) {
        if (sets.keyFieldType) {
          keys[i].each(itm => {
            return this.db.fieldTypes[sets.keyFieldType].getValueToSave(
              this,
              itm
            );
          }, true);
        }
        ids = ids.concat(keys[i]);
      } else {
        ids.push(
          sets.keyFieldType
            ? this.db.fieldTypes[sets.keyFieldType].getValueToSave(
                this,
                keys[i]
              )
            : keys[i]
        );
      }
    });
    find[sets.keyField] = { $in: ids };

    sets.fields[sets.keyField] = 1;

    this.src.db
      .collection(sets.collection)
      .find(find, sets.fields)
      .toArray(function(e, d) {
        cb(d);
      });
  },

  /**
   * @method
   * Server method
   *
   * Alias of "getControllerName"
   * @private
   */
  getName: function() {
    return this.getControllerName(); //Object.getPrototypeOf(this).$className
  },

  /**
   * @method
   * Server method
   *
   * Getting short name of the model
   * @private
   */
  getShortName: function() {
    return this.getName().replace(/\./g, "-");
    //var s = this.getName().split('.');
    //return s[s.length-3] + '-' + s[s.length-1];
  },

  /**
   * @method
   * Server method
   *
   * Prepare one result record for returning
   * @param {Object} rec one record of results
   * @param {Function} callback
   * @private
   */
  prepRecord: function(rec, callback) {
    var me = this,
      i = 0;

    var func = function() {
      if (i >= me.fields.length) {
        callback(rec);
        return;
      }
      var log = false;
      for (var j in rec) {
        if (j == me.fields[i].name) {
          log = true;
          break;
        }
      }
      var nxtCall = function() {
        if (!!me.fields[i].renderer) {
          rec[me.fields[i].name] = me.fields[i].renderer(
            rec[me.fields[i].name],
            rec
          );
        }
        i++;
        func.nextCall();
      };
      if (me.isBinded && me.fields[i].bindTo && me.binds[me.fields[i].name]) {
        rec[me.fields[i].name] = me.getBindedValue(
          rec[me.fields[i].name],
          me.binds[me.fields[i].name],
          me.fields[i].bindTo.keyField
        );
        nxtCall();
      } else if (
        me.fields[i].type &&
        log &&
        me.db.fieldTypes[me.fields[i].type]
      ) {
        me.db.fieldTypes[me.fields[i].type].getDisplayValue(
          me,
          rec,
          me.fields[i].name,
          function(val) {
            rec[me.fields[i].name] = val;
            nxtCall();
            //i++;
            //func.nextCall()
          },
          me.fields[i]
        );
      } else {
        nxtCall();
        //i++;
        //func.nextCall()
      }
    };
    func();
  },

  getBindedValue: function(dbData, bindData, keyField) {
    if (Ext.isArray(dbData)) {
      var out = [];
      dbData.forEach(itm => {
        for (var i = 0; i < bindData.length; i++) {
          if (itm + "" == bindData[i][keyField] + "") {
            out.push(bindData[i]);
            return;
          }
        }
      });
      return out;
    } else {
      for (var i = 0; i < bindData.length; i++) {
        if (dbData + "" == bindData[i][keyField] + "") return bindData[i];
      }
    }
  },

  /**
   * @method
   * Server method
   *
   * Getting data by params
   * @param {Object} params
   * @param {Function} callback
   * @private
   */
  getData: function(params, callback) {
    var me = this;
    // fix for extjs >= 5

    if (!params.filters) params.filters = [];

    if (params._start) params.start = params._start;
    if (params._limit) params.limit = params._limit;
    if (params._filters) {
      params.filters = params.filters.concat(params._filters);
    }
    if (params._sorters) params.sorters = params._sorters;

    [
      function(call) {
        if (params && params.reorder) {
          if (Ext.isString(params.reorder)) {
            try {
              params.reorder = JSON.parse(params.reorder);
            } catch (e) {
              params.reorder = null;
            }
          }
          if (params.reorder) {
            me.reorder(params.reorder, function() {
              call();
            });
          } else call();
        } else call();
      },

      function(call) {
        me.buildWhere(params, function(find) {
          call(find);
        });
      },
      function(find, call) {
        me.getReadableFields(params, function(fields) {
          call(find, fields);
        });
      },
      function(find, fields, call) {
        me.buildSort(params, function(sort) {
          call(find, fields, sort);
        });
      },
      function(find, fields, sort, call) {
        me.buildLimits(params, function(start, limit) {
          call(find, fields, sort, start, limit);
        });
      },
      function(find, fields, sort, start, limit, call) {
        if (me.find) {
          for (var i in me.find) find[i] = me.find[i];
        }
        if (me.removeAction != "remove" && !me.strongRequest) {
          find.removed = { $ne: true };
        } else if (find.removed) delete find.removed;

        if (me.strongRequest) {
          fields = {};
          me.fields.forEach(function(f) {
            if (f && f.visible) fields[f.name] = 1;
          });
        } else {
          fields.maker = 1;
          fields.signobject = 1;
        }

        //console.log('\n\nc:', me.collection, ' f:',JSON.stringify(find), ' fl:', fields, ' s:',sort, ' st:', start, 'l:', limit)
        me.findData(me.collection, find, fields, sort, start, limit, function(
          total,
          data
        ) {
          call(total, data);
        });
      },
      function(total, data, call) {
        if (!!me.afterGetData) {
          me.afterGetData(data, function(data) {
            call(total, data);
          });
        } else call(total, data);
      },
      function(total, data) {
        if (data) {
          me.builData(
            data,
            function(data) {
              callback({ total: total, list: data }, null);
            },
            null,
            params
          );
        } else {
          callback({ total: 0, list: [] }, null);
        }
      }
    ].runEach();
  },

  findData: function(collection, find, fields, sort, start, limit, cb) {
    this.db.getData(collection, find, fields, sort, start, limit, function(
      total,
      data
    ) {
      cb(total, data);
    });
  }
});
