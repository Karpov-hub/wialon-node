Ext.define("Core.data.actions.Remove", {
  mixins: ["Crm.classes.AdminLogs"],

  /**
   * @method
   * Server method
   *
   * Remove records with checking access rights
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $remove: function(data, callback) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.del) me.remove(data.records, callback);
        else me.error(401);
      },
      null,
      data
    );
  },

  /**
   * @method
   * Server method
   *
   * @param {Array} ids
   * @param {Function} callback
   */
  beforeRemove: function(ids, callback) {
    callback(ids);
  },

  /**
   * @method
   * Server method
   *
   * @param {Array} ids
   * @param {Function} callback
   */
  afterRemove: function(ids, callback) {
    callback(true);
  },

  /**
   * @method
   * Server and client method
   *
   * @param {Array} ids
   * @param {Function} callback
   */
  remove: function(data, callback) {
    var me = this;
    [
      function(call) {
        if (data && Ext.isArray(data)) {
          var ids = [];

          var fnc = function(i) {
            if (i >= data.length) {
              if (ids.length) {
                call(ids);
              } else {
                callback({ success: false });
              }
              return;
            }
            me.db.fieldTypes[me.fields[0].type].getValueToSave(
              me,
              data[i],
              null,
              null,
              null,
              function(_id) {
                if (_id) {
                  ids.push(_id);
                }
                fnc(i + 1);
              }
            );
          };
          fnc(0);
        }
      },
      // Before removing
      function(ids, call) {
        me.beforeRemove(ids, function(ids) {
          if (ids && ids.length) call(ids);
          else callback({ success: false });
        });
      },
      // Removing
      async function(ids, call) {
        const logData = {
          _admin_id: me.user.id,
          collection: me.collection,
          recordsToRemove: ids
        };
        await me.logPush(logData, { ...ids }, true);

        var oo = {};
        oo[me.idField] = { $in: ids };
        if (!me.removeAction || me.removeAction == "mark") {
          // Marking as removed

          var set = { removed: true };
          set = me.setModifyTime(set);

          me.db
            .collection(me.collection)
            .update(oo, { $set: set }, { multi: true }, function(e, d) {
              call(ids);
            });
        } else {
          // Remove from collection
          me.db
            .collection(me.collection)
            .remove(oo, { multi: 1 }, function(e, d) {
              call(ids);
            });
        }
      },

      function(ids, call) {
        me.removeFromSearchIndex(ids, function() {
          call(ids);
        });
      },

      // After removing
      function(ids, call) {
        me.afterRemove(ids, function(result) {
          if (result === null || result) {
            me.changeModelData(
              Object.getPrototypeOf(me).$className,
              "remove",
              ids
            );
            callback({ success: true });
          } else callback({ success: false });
        });
      }
    ].runEach();
  },

  removeFromSearchIndex: function(ids, cb) {
    Ext.create("Core.search.SearchEngine", { model: this }).remove(ids, cb);
  }
});
