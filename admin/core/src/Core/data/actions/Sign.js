Ext.define("Core.data.actions.Sign", {
  isNeedSign: function(cb, data) {
    this.src.db.collection("signset").findOne(
      {
        module: this.getName().replace(/\./g, "-")
      },
      { active: 1, priority: 1 },
      function(e, d) {
        cb(d || null);
      }
    );
  },

  checkSignObject: function(data, sigSet) {
    var me = this,
      log = me.checkCanUserSign(sigSet) !== false;
    data.list.each(function(d) {
      me.checkSignObjectOne(d, log, sigSet);
      return d;
    }, true);
  },

  checkCanUserSign: function(sigSet) {
    if (!sigSet || !sigSet.priority) return false;
    for (var i = 0; i < sigSet.priority.length; i++) {
      if (sigSet.priority[i].user) {
        if (sigSet.priority[i].user + "" == this.user.id + "") {
          return i;
        }
      } else if (
        sigSet.priority[i].group &&
        sigSet.priority[i].group + "" == this.user.profile.groupid + ""
      ) {
        return i;
        break;
      }
    }
    return false;
  },

  checkSignObjectOne: function(d, canUserSign) {
    if (d.signobject) {
      d.signobject.shouldSign = false;
      if (canUserSign) {
        d.signobject.signed = this.checkSignedObject(d.signobject.signs);
        d.signobject.shouldSign = true; //!d.signobject.signed;
      } else if (d.maker + "" == (this.user.id || this.user._id) + "") {
        d.signobject.shouldSign = true;
      } else if (
        this.fieldParentId &&
        this.user.pid &&
        this.user.pid == d[this.fieldParentId]
      ) {
        d.signobject = { shouldSign: true };
      }
      if (d.signobject.signs && d.signobject.signs.length) {
        d.signobject.blocked = true;
      }
    } else {
      if (d.maker + "" == (this.user.id || this.user._id) + "") {
        d.signobject = { shouldSign: true };
      } else if (
        this.fieldParentId &&
        this.user.pid &&
        this.user.pid == d[this.fieldParentId]
      ) {
        d.signobject = { shouldSign: true };
      }
    }
  },

  checkSignedObject: function(signs) {
    for (var i = 0; i < signs && signs.length; i++) {
      if (signs + "" == this.user.id + "") return true;
    }

    return false;
  },

  AutoSignDo: function(data, cb) {
    var me = this;

    [
      function(next) {
        if (!me.user) {
          me.src.db
            .collection("admin_users")
            .findOne(
              { $or: [{ superuser: 1 }, { superuser: true }] },
              {},
              function(e, d) {
                if (d) {
                  me.user = { id: d._id, profile: d };
                }
                next();
              }
            );
        } else next();
      },
      function() {
        me.$signRecord(data, function() {
          cb();
        });
      }
    ].runEach();
  },

  $signRecord: function(data, cb) {
    var me = this,
      curRec,
      sigSet,
      toSaveData,
      curUserSigIndex,
      _id = me.src.db.fieldTypes[me.fields[0].type].StringToValue(
        data[this.idField]
      );

    [
      function(next) {
        me.isNeedSign(function(res) {
          curUserSigIndex = me.checkCanUserSign(res);
          if (!res) {
            cb({ success: false, mess: "Access denied 1" });
            return;
          }
          sigSet = res;
          next();
        }, data);
      },
      function(next) {
        var oo = {};
        oo[me.idField] = _id;

        me.dbCollection.findOne(oo, {}, function(e, d) {
          me.checkSignObjectOne(d, true, sigSet);

          if (d.signobject && d.signobject.shouldSign) {
            curRec = d;
            curRec[me.idField] = _id;
            next();
          } else {
            cb({ success: false, mess: "Access denied 2" });
          }
        });
      },
      function(next) {
        if (curUserSigIndex === false) curUserSigIndex = 0;
        else curUserSigIndex++;
        if (!curRec.signobject.signs) curRec.signobject.signs = [];
        if (!me.checkSignedObject(curRec.signobject.signs)) {
          curRec.signobject.signs.push(me.user.id);

          if (!curRec.signobject.history) curRec.signobject.history = [];
          curRec.signobject.history.push({
            date: new Date(),
            user: me.user.profile.name || me.user.profile.login,
            note: "Signed"
          });
        }

        toSaveData = { signobject: curRec.signobject };
        // если есть следующий подписант в списке,
        // отправим ему сообщение
        if (me.isNeedSendSigMessage && sigSet.priority[curUserSigIndex]) {
          me.sendSigMessage(
            sigSet.priority[curUserSigIndex],
            curRec[me.idField],
            "sign",
            "",
            next
          );
        } else {
          // если нет, опубликуем сообщение
          me.sendMessageOnSignActivate(curRec, function() {
            if (!!me.onSignActivate) {
              me.onSignActivate(curRec, toSaveData, function(x) {
                //toSaveData.active = x !== false;
                next();
              });
            } else {
              toSaveData.active = true;
              next();
            }
          });
        }
      },
      function(next) {
        var oo = {};
        oo[me.idField] = curRec[me.idField];
        if (toSaveData) {
          me.dbCollection.update(oo, { $set: toSaveData }, function(e, d) {
            if (d) {
              next();
            } else cb({ success: false, mess: "Access denied 3" });
          });
        } else next();
      },
      function() {
        if (!!me.onSign) {
          toSaveData[me.idField] = curRec[me.idField];
          me.onSign(
            toSaveData,
            function() {
              cb({ success: true });
            },
            curRec
          );
        } else cb({ success: true });
      }
    ].runEach();
  },

  $unSignRecord: function(data, cb) {
    var me = this,
      curRec,
      sigSet,
      curUserSigIndex,
      _id = me.src.db.fieldTypes[me.fields[0].type].StringToValue(
        data[me.idField]
      );

    [
      function(next) {
        var oo = {};
        oo[me.idField] = _id;
        me.dbCollection.findOne(oo, {}, function(e, d) {
          if (d) {
            curRec = d;
            next();
          } else cb({ success: false, mess: "Not found" });
        });
      },
      function(next) {
        if (me.canMakerUnsign && curRec.maker + "" == me.user.id + "") {
          next();
        } else {
          me.isNeedSign(function(res) {
            curUserSigIndex = me.checkCanUserSign(res);
            if (!res || curUserSigIndex === false) {
              cb({ success: false, mess: "Access denied" });
              return;
            }
            sigSet = res;
            next();
          }, curRec);
        }
      },

      function(next) {
        if (!curRec.signobject) {
          curRec.signobject = {};
        }
        curRec.signobject.signs = [];
        curRec.signobject.blocked = false;
        if (!curRec.signobject.history) curRec.signobject.history = [];
        curRec.signobject.history.push({
          date: new Date(),
          user: me.user.profile.name || me.user.profile.login,
          note: data.note
        });
        var oo = {};
        oo[me.idField] = _id;
        var setObj = { signobject: curRec.signobject, active: false };

        me.dbCollection.update(oo, { $set: setObj }, function(e, d) {
          next(oo);
        });
      },

      function(find, next) {
        if (curRec.maker + "" == me.user.id + "") {
          next(find);

          return;
        }
        me.sendSigMessage(
          { user: curRec.maker },
          curRec[me.idField],
          "unsign",
          data.note,
          function() {
            next(find);
          }
        );
      },
      function(find) {
        if (!!me.onUnSign) {
          me.onUnSign(
            curRec,
            function() {
              cb({ success: true });
            },
            data.note,
            find
          );
        } else cb({ success: true });
      }
    ].runEach();
  },

  buildSigUrl: function(recId) {
    return (
      "#" +
      Object.getPrototypeOf(this)
        .$className.replace(".model.", ".view.")
        .replace(/Model$/, "Form") +
      "~" +
      recId
    );
  },

  async sendWorkflowMessage(data) {
    let users = [];
    if (data.receiver.group) {
      users = await this.getUsersByGroup(data.receiver.group);
    } else {
      users = [data.receiver.user];
    }

    users.prepEach(
      (user, next) => {
        this.sendSigMessage(
          { user },
          data.record[this.idField],
          "sign",
          "",
          () => {
            next();
          }
        );
      },
      () => {}
    );
  },

  sendSigMessage: function(user, recId, type, note, cb) {
    var me = this,
      msg,
      sbj,
      to,
      uri;

    this.getSigUsersForMessage(
      user,
      usrIds => {
        if (usrIds) {
          uri = this.buildSigUrl(recId);
          if (type == "sign") {
            sbj = this.config.messages.signSubject;
            msg = this.config.messages.signBody.replace("{uri}", uri);
          } else if (type == "unsign") {
            sbj = this.config.messages.unsignSubject;
            msg = this.config.messages.unsignBody
              .replace("{uri}", uri)
              .replace("{note}", note);
          }

          Ext.create("Crm.modules.messages.model.MessagesModel", {
            scope: me
          }).write(
            {
              subject: sbj,
              body: msg,
              to: usrIds,
              touser: usrIds,
              new: true
            },
            function() {
              cb();
            },
            { add: true }
          );
        } else cb();
      },
      recId
    );
  },

  getSigUsersForMessage: function(users, cb) {
    cb(users.user + "");
  },

  $getFileFromField: function(data, cb) {
    if (!data || !data.name || !data[this.idField]) {
      this.error(404);
      return;
    }
    var me = this,
      fld = {};
    _id = me.src.db.fieldTypes[me.fields[0].type].StringToValue(
      data[this.idField]
    );
    fld[data.name] = 1;
    var oo = {};
    oo[me.idField] = _id;
    me.dbCollection.findOne(oo, fld, function(e, d) {
      if (d && d[data.name] && d[data.name].data && d[data.name].name) {
        me.sendFile(d[data.name]);
      } else {
        me.error(404);
      }
    });
  },

  sendFile: function(data) {
    var headers = {
      "Content-Disposition":
        'attachment; filename="' + encodeURIComponent(data.name) + '"',
      "Content-Length": data.data.buffer.length
    };
    this.response.writeHead(200, "OK", headers);
    this.response.end(data.data.buffer);
  },

  getFilterByName: function(params, name, remove) {
    var f;
    if (params._filters) {
      for (var i = 0; i < params._filters.length; i++) {
        if (params._filters[i]._property == name) {
          f = {
            operator: params._filters[i]._operator,
            value: params._filters[i]._value
          };
          if (remove) {
            params._filters.splice(i, 1);
          }
          return f;
        }
      }
    }
    if (params.filters) {
      for (var i = 0; i < params.filters.length; i++) {
        if (params.filters[i].property == name) {
          f = params.filters[i];
          if (remove) {
            params.filters.splice(i, 1);
          }
          return f;
        }
      }
    }
    return null;
  },

  sendMessageOnSignActivate: function(data, cb) {
    if (!this.config.messages || !this.config.messages.signSuccessSubject) {
      cb();
      return;
    }

    var view =
      this.viewForm ||
      this.getName()
        .replace(".model.", ".view.")
        .replace("Model", "Form");

    var mess = {
      subject: this.config.messages.signSuccessSubject,
      touser: [data.maker],
      body: Ext.create("Ext.XTemplate", this.config.messages.signSuccessBody)
        .compile()
        .apply({
          uri: view + "~" + data._id
        })
    };
    Ext.create("Crm.modules.messages.model.MessagesModel", {
      scope: this
    }).write(
      mess,
      function() {
        cb(data);
      },
      { add: true }
    );
  }
});
