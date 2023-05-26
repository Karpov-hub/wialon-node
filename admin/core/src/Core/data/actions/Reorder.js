Ext.define("Core.data.actions.Reorder", {
  /**
   * @method
   * Server method
   *
   * Reordering records with checking access rights
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $reorder: function(data, cb) {
    var me = this;
    me.getPermissions(
      function(permis) {
        if (permis.modify) me.reorder(data, cb);
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
   * @param {Array} movable array of record id for moveing
   * @param {String} fieldName field name of sorting
   * @param {Number} indx index for paste
   * @param {Function} callback
   */
  beforeReorder: function(movable, fieldName, indx, callback) {
    callback(movable, fieldName, indx);
  },

  /**
   * @method
   * Server method
   *
   * @param {Array} movable array of record id for moveing
   * @param {String} fieldName field name of sorting
   * @param {Number} indx index for paste
   * @param {Function} callback
   */
  afterReorder: function(movable, fieldName, indx, callback) {
    callback(movable);
  },

  /**
   * @method
   * Server method
   *
   * @param {Object} params
   * @param {Function} callback
   */
  reorder: function(params, callback) {
    var me = this;

    [
      // get id param
      function(call) {
        if (params && params.dropRec && params.dropRec[me.idField]) {
          me.src.db.fieldTypes[me.fields[0].type].StringToValue(
            params.dropRec[me.idField],
            function(id) {
              if (id) call(id);
              else callback(false);
            }
          );
        } else callback(false);
      },

      // validating params
      function(id, call) {
        if (
          params &&
          params.records &&
          Ext.isArray(params.records) &&
          params.records.length
        ) {
          var movable = [],
            purp = id;
          params.records.each(function(r) {
            if (r && r[me.idField]) {
              r[me.idField] = me.src.db.fieldTypes[
                me.fields[0].type
              ].StringToValue(r[me.idField]);
              if (r[me.idField]) movable.push(r[me.idField]);
            }
          });
          if (purp && movable.length) {
            call(purp, movable);
            return;
          }
        }
        callback(false);
      },
      // finding sortfield
      function(purp, movable, call) {
        for (var i = 0; i < me.fields.length; i++) {
          if (me.fields[i].type == "sortfield") {
            call(purp, movable, me.fields[i].name);
            return;
          }
        }
        callback(false);
      },
      // getting sort field value
      function(purp, movable, fieldName, call) {
        var fld = {};
        fld[fieldName] = 1;
        var oo = {};
        oo[me.idField] = purp;
        me.db.collection(me.collection).findOne(oo, fld, function(e, d) {
          if (d && (d[fieldName] || d[fieldName] === 0)) {
            call(movable, fieldName, d[fieldName]);
            return;
          }
          callback(false);
        });
      },

      function(movable, fieldName, indx, call) {
        me.beforeReorder(movable, fieldName, indx, call);
      },

      // moving other items down
      function(movable, fieldName, indx, call) {
        var upd = {},
          set = {};
        if (params.position && params.position != "before") indx++;
        upd[fieldName] = { $gte: indx };
        set[fieldName] = movable.length;
        me.db
          .collection(me.collection)
          .updateMany(upd, { $inc: set }, function(e, d, qr) {
            call(movable, fieldName, indx);
          });
      },
      // updating movable items
      function(movable, fieldName, indx, call) {
        var i = 0;
        var func = function() {
          if (i >= movable.length) {
            call(movable, fieldName, indx);
            return;
          }
          var set = {};
          set[fieldName] = indx;
          var oo = {};
          oo[me.idField] = movable[i];
          me.db
            .collection(me.collection)
            .updateOne(oo, { $set: set }, function(e, d, qr) {
              indx++;
              i++;
              func();
            });
        };
        func();
      },

      function(movable, fieldName, indx) {
        me.afterReorder(movable, fieldName, indx, function() {
          callback(true);
        });
      }
    ].runEach();
  }
});
