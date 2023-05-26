Ext.define("Core.data.actions.Copy", {
  /**
   * @method
   * Server method
   *
   * Create copy of a record with checking access rights
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $copy: function(data, callback) {
    var me = this;
    [
      function(call) {
        if (data && data[me.idField]) {
          me.src.db.fieldTypes[me.fields[0].type].StringToValue(
            data[me.idField],
            call
          );
        } else callback(null);
      },
      function(id) {
        me.getPermissions(function(permis) {
          if (permis.add) me.copy(id, callback);
          else me.error(401);
        });
      }
    ].runEach();
  },

  /**
   * @method
   * Server method
   *
   * @param {Object} record
   * @param {Function} callback
   */
  beforeCopy: function(record, callback) {
    callback(record);
  },

  /**
   * @method
   * Server method
   *
   * @param {Object} record
   * @param {Function} callback
   */
  afterCopy: function(record, callback) {
    callback(record);
  },

  /**
   * @method
   * Server and client method
   *
   * Create copy of a record
   * @param {ObjectId} _id Id of a record to copy
   * @param {Function} callback
   * @private
   */
  copy: function(_id, callback) {
    var me = this;
    [
      function(call) {
        var oo = {};
        oo[me.idField] = _id;
        me.db.collection(me.collection).findOne(oo, {}, function(e, record) {
          if (record) call(record);
          else callback(null);
        });
      },
      function(record, call) {
        me.beforeCopy(record, function(record) {
          if (record) call(record);
          else callback(null);
        });
      },
      function(record, call) {
        var savedID = [];
        savedID.push(record[me.idField]);

        delete record[me.idField];

        record = me.setModifyTime(record);

        me.db.collection(me.collection).insert(record, function(e, data) {
          if (data && data[0]) {
            if (me.binded) {
              me.copyBindedData(savedID[0], data[0][me.idField], function() {
                call(data[0]);
              });
            } else call(data[0]);
          } else callback(null);
        });
      },
      function(data, call) {
        me.changeModelData(Object.getPrototypeOf(me).$className, "ins", data);
        call(data);
      },

      function(record, call) {
        me.afterCopy(record, function(record) {
          if (record) call(record);
          else callback(null);
        });
      },
      function(record, call) {
        me.builData([record], function(data) {
          callback(data[0]);
        });
      }
    ].runEach();
  },

  copyBindedData: function(srcId, dstId, cb) {
    var me = this,
      i = 0;
    var f = function() {
      if (i >= me.binded.length) {
        cb();
        return;
      }
      me.copyBindedDataRecs(srcId, dstId, me.binded[i], function() {
        i++;
        f();
      });
    };
    f();
  },

  copyBindedDataRecs: function(srcId, dstId, bind, cb) {
    var me = this,
      model = Ext.create(bind.model, { src: me.src, config: me.config });

    [
      function(next) {
        var find =
          me.removeAction == "remove" ? {} : { removed: { $ne: true } };
        find[bind.pidField] = srcId;
        var oo = {};
        oo[me.idField] = 1;
        me.src.db
          .collection(model.collection)
          .find(find, oo)
          .toArray(function(e, data) {
            if (data && data.length) {
              var ids = [];
              data.each(function(d) {
                ids.push(d[me.idField]);
              });
              next(ids);
            } else cb();
          });
      },
      function(ids, next) {
        var i = 0;
        var f = function() {
          if (i >= ids.length) {
            cb();
            return;
          }
          model.copy(ids[i], function(d) {
            if (d) {
              var set = {};
              set[bind.pidField] = dstId;
              var oo = {};
              oo[me.idField] = d[me.idField];
              me.src.db
                .collection(model.collection)
                .updateOne(oo, { $set: set }, function() {
                  i++;
                  f.nextCall();
                });
            } else {
              i++;
              f.nextCall();
            }
          });
        };
        f();
      }
    ].runEach();
  }
});
