Ext.define("Core.data.actions.Write", {
  mixins: ["Crm.classes.AdminLogs"],

  /**
   * @method
   * Server method
   *
   * Saving changed record with checking access rights
   * @param {Object} params
   * @param {Function} callback
   *
   */
  $write: function(data, callback) {
    var me = this;
    if (!data) {
      me.error(401);
      return;
    }
    if (data.noChangeModel) {
      me.noChangeModel = true;
    }
    me.getPermissions(function(permis) {
      me.write(data, callback, permis);
      /*if(data._id && (permis.modify || ))
                me.write(data, callback)
            else if(!data._id && permis.add)
                me.write(data, callback)
            else
                me.error(401)
            */
    });
  },

  /**
   * @method
   * Server and client method
   *
   * Saving data
   * @param {Object} data record to save
   * @param {Function} callback
   * @private
   */
  write: async function(data, callback, permissions, fields, runInBackground) {
    var me = this,
      insdata = {},
      isNew = false,
      //,db = tx? tx.db : me.src.db
      actionType;
    await this.logPush(data, null, true);

    [
      function(call) {
        var isValid = me.isValid(data);
        if (isValid === true) {
          call();
        } else {
          me.error(415, { mess: isValid.join("; ") });
        }
      },
      function(call) {
        if (!!me.beforeSave) {
          me.beforeSave(data, call);
        } else call(data);
      },

      function(data, call) {
        if (!data || data.success === false) {
          callback(data);
          return;
        }
        call(data);
      },

      function(data, call) {
        if (
          data &&
          data[me.idField] &&
          data[me.idField] != "-" &&
          !me.insertStrong
        ) {
          call("upd", data);
        } else {
          //if(data[me.idField]) delete data[me.idField];
          call("ins", data);
        }
        //}, null, data)
      },

      function(type, data, call) {
        // Updating

        actionType = type;
        if (type == "ins") {
          call(true, data);
          return;
        }
        me.db.fieldTypes[me.fields[0].type].getValueToSave(
          me,
          data[me.idField] + "",
          null,
          null,
          null,
          function(_id) {
            var oo = {};
            oo[me.idField] = _id;
            me.db
              .collection(me.collection)
              .findOne(oo, function(err, cur_data) {
                if (cur_data) {
                  var fff = function(permis) {
                    if (permis.modify) {
                      me.createDataRecord(
                        data,
                        cur_data,
                        function(data) {
                          if (!me.strongRequest) {
                            data.mtime = new Date();
                            data = me.setModifyTime(data);
                          }

                          me.updateDataInDb(_id, data, function(e, d) {
                            data[me.idField] = _id;
                            //if(!) {
                            me.isNeedSign(function(res) {
                              if (!!res) {
                                if (cur_data.signobject)
                                  data.signobject = cur_data.signobject;
                                else data.signobject = {};
                                data.signobject.shouldSign = true;
                              }
                              call(false, data);
                            }, data);

                            //} else
                            //    call(false, data)
                          });
                        },
                        fields
                      );
                    } else me.error(401);
                  };

                  if (permissions) fff(permissions);
                  else me.getPermissions(fff, null, cur_data);
                } else {
                  data[me.idField] = _id;
                  actionType = "ins";
                  call(true, data);
                }
              });
          }
        );
      },

      function(ins, data, call) {
        // Inserting
        if (ins) {
          var _id = data[me.idField];
          me.createDataRecord(
            data,
            null,
            function(data) {
              if (!me.strongRequest) {
                if (!data.ctime) data.ctime = new Date();
                if (!data.mtime) data.mtime = new Date();
                if (me.user) data.maker = me.user.id;
                data = me.setModifyTime(data);
                if (!me.removeAction || me.removeAction == "mark")
                  data.removed = 0;
              }
              if (_id) data[me.idField] = _id;
              else if (!!me.db.fieldTypes[me.fields[0].type].createNew) {
                data[me.idField] = me.db.fieldTypes[
                  me.fields[0].type
                ].createNew(me.src.db);
              }
              var fff = function(permis) {
                if (permis.add) {
                  me.insertDataToDb(data, function(e, d) {
                    isNew = true;
                    if (!e) {
                      me.isNeedSign(function(res) {
                        if (!!res) {
                          data.signobject = { shouldSign: true };
                          if (me.autoSign) {
                            me.AutoSignDo(data, function() {
                              call(data);
                            });
                          } else call(data);
                        } else call(data);
                      }, data);
                    } else {
                      console.log("Insert error:", e, data);
                      callback({ success: false, error: e });
                      return;
                    }
                  });
                } else me.error(401);
              };

              if (permissions) fff(permissions);
              else me.getPermissions(fff);
            },
            fields
          );
        } else {
          call(data);
        }
      },

      function(data, call) {
        if (!!me.afterSave) {
          me.afterSave(
            data,
            function(data) {
              call(data);
            },
            isNew
          );
        } else {
          call(data);
        }
      },

      function(data, call) {
        if (runInBackground) callback({ success: true, record: data });
        else
          me.builData([data], function(data) {
            me.addDataToSearchIndex(data, function() {
              me.changeModelData(
                Object.getPrototypeOf(me).$className,
                actionType,
                data[0]
              );
              callback({ success: true, record: data[0] });
            });
          });
      }
    ].runEach();
  },

  insertDataToDb: function(data, cb) {
    this.dbCollection.insert(data, cb);
  },

  updateDataInDb: function(_id, data, cb) {
    var oo = {};
    oo[this.idField] = _id;
    this.dbCollection.update(oo, { $set: data }, cb);
  },

  addDataToSearchIndex: function(data, cb) {
    if (this.config.elasticsearch)
      Ext.create("Core.search.SearchEngine", { model: this }).indexer(data, cb);
    else cb();
  },

  /**
   * @method
   * Server method
   *
   * Creating record for saving
   * @param {Object} data new record
   * @param {Object} cur_data old saved data
   * @param {Function} callback
   * @private
   */
  createDataRecord: function(data, cur_data, callback, fields) {
    var me = this,
      insdata = {},
      i = 0,
      f = function() {
        if (i >= me.fields.length) {
          callback(insdata);
          return;
        }

        if (
          me.fields[i].name == me.idField ||
          me.fields[i].mapping == me.idField
        ) {
          i++;
          f.nextCall();
          return;
        }
        var cnf = me.fields[i].cnf || {},
          name = me.fields[i].mapping || me.fields[i].name;
        if (me.fields[i].editable && (!fields || fields.indexOf(name) != -1)) {
          (
            me.db.fieldTypes[me.fields[i].type] || me.db.fieldTypes.Field
          ).getValueToSave(me, data[name], data, cur_data, name, function(
            val,
            saveNull
          ) {
            if (
              (val !== null && val !== undefined) ||
              (val === null && saveNull)
            )
              insdata[name] = val;
            i++;
            f.nextCall();
          });
        } else {
          i++;
          f.nextCall();
        }
      };

    f();
  }
});
