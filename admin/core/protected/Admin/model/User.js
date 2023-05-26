var crypto = require("crypto");

Ext.define("Admin.model.User", {
  extend: "Core.AbstractModel",

  /**
   * Private login method
   **/

  getAutorization: function(params, callback) {
    var collection = this.src.db.collection(params.collection),
      mail = this.src.mailTransport,
      config = this.config,
      mem = this.src.mem,
      pass = params.password,
      lifetime = params.lifetime || config.token.lifetime,
      exp = config.exp || false,
      me = this,
      passField = params.passField || "pass",
      idField = this.config.idField || "_id";
    collection.findOne(params.find, function(e, r) {
      if (r) {
        if (
          (config.testPassword && pass == config.testPassword) || //should be removed in PRODUCTION
          r[passField] ==
            crypto
              .createHash(config.hashtype)
              .update(pass)
              .digest("hex")
        ) {
          if (r.activated === false) {
            callback({ status: "blocked" });
            return;
          }

          // login success
          // generate token and put it into memcoache
          crypto.randomBytes(config.token.len, function(ex, buf) {
            var token = buf.toString("hex");

            if (exp == "true") lifetime = 30 * 86400; // секунд в месяце

            mem.add(token, r[idField], lifetime, function(er, res) {
              if (res === true) {
                // if good
                if (r.email && r.dblauth) {
                  // if needed dbl authorisation, making session pass and sending it
                  crypto.randomBytes(config.token.sessPassLen, function(
                    ex,
                    buf
                  ) {
                    var sess = buf.toString("hex");
                    mem.add(token, sess, lifetime, function(er, res) {
                      if (res === true) {
                        mail.sendMail({
                          from: config.mail.from,
                          to: r.email,
                          subject: config.mail.loginAuthSubject,
                          text: config.mail.loginAuthBody.replace(
                            "${pass}",
                            sess
                          )
                        });
                        callback(
                          { id: r[idField], token: token, dblauth: true },
                          null
                        );
                      } else {
                        callback(null, { code: 500 }); // if memcache error
                      }
                    });
                  });
                } else {
                  callback(
                    { id: r[idField], token: token, dblauth: false, user: r },
                    null
                  );
                }
              } else {
                callback(null, { mess: 500 }); // if memcache error
              }
            });
          });
        } else {
          // login fault

          console.log(401);

          callback(null, { code: 401 });
        }
      } else callback(null, e);
    });
  },

  /**
   * Private login method
   **/
  enter2step: function(data, callback) {
    var me = this,
      mem = me.src.mem,
      lifetime = me.config.token.lifetime;

    mem.get(data.token, function(e, r) {
      if (r == data.pass) {
        mem.set(
          data.token,
          data.id,
          function(e, r) {
            if (r == "STORED") {
              callback(data, null);
            } else callback(null, { mess: "Internal server error" }); // if memcache error
          },
          lifetime
        );
      }
    });
  },

  /**
   * Get user info
   **/
  getUserInfo: function(params, cb) {
    var me = this;
    var callback = function(data, err) {
      [
        function(next) {
          if (params.extraInfo) {
            params.extraInfo(me.src.db, data, function(data, extraInfo) {
              next(Ext.apply(data, extraInfo));
            });
          } else {
            next(data);
          }
        },
        function(data) {
          if (data && data.xgroups && data.xgroups.length) {
            me.getExtendedPermissions(data, cb);
          } else {
            cb(data, err);
          }
        }
      ].runEach();
    };

    if (!params.auth) {
      callback(null, { code: 401 });
      return;
    }
    me.src.db
      .collection("admin_users")
      .findOne({ _id: params.auth }, {}, function(e, data) {
        if (data) {
          me.src.db.fieldTypes.object.getDisplayValue(
            null,
            data,
            "sets",
            function(sets) {
              data.sets = sets;
              me.src.db.collection("groups").findOne(
                {
                  _id: data.groupid
                },
                {
                  //modelaccess:1,
                  //pagesaccess: 1,
                  //desktopclassname: 1,
                  //autorun: 1,
                  //code:1,
                  //groupname:1//,level:1
                },
                function(e, gdata) {
                  if (gdata) {
                    [
                      function(call) {
                        me.src.db.fieldTypes.object.getDisplayValue(
                          null,
                          gdata,
                          "modelaccess",
                          function(val) {
                            gdata.modelaccess = val;
                            call();
                          }
                        );
                      },
                      function(call) {
                        me.src.db.fieldTypes.object.getDisplayValue(
                          null,
                          gdata,
                          "pagesaccess",
                          function(val) {
                            gdata.pagesaccess = val;
                            call();
                          }
                        );
                      },
                      function(call) {
                        data.group = gdata;
                        callback(data);
                      }
                    ].runEach();
                    return;
                  }
                  callback(data);
                }
              );
            }
          );
        } else callback(null, e);
      });
  },

  /**
   * Saving user settings
   **/
  setUserSets: function(params, callback) {
    var me = this;
    me.src.db.fieldTypes.object.getValueToSave(
      null,
      params.jsonData,
      null,
      null,
      null,
      function(setData) {
        me.src.db
          .collection("admin_users")
          .updateOne(
            { _id: params.auth },
            { $set: { sets: setData } },
            function(e, data) {
              callback({ ok: true });
            }
          );
      }
    );
  },

  /**
   * Get user access rates
   **/
  getUserAccessRates: function(params, callback) {
    if (!params.auth) {
      callback(null, { code: 401 });
      return;
    }
    var me = this;
    me.getUserInfo(params, function(data) {
      if (!data) {
        callback(null);
        return;
      }
      if (data.superuser) {
        callback({ superuser: true });
      } else {
        if (data) {
          callback(data.group);
        } else {
          callback(null, e);
        }
      }
    });
  },
  /**
   * Get extended permissions
   */
  getExtendedPermissions: function(data, cb) {
    let xgroups = [];
    data.xgroups.forEach((g) => {
      if (g) xgroups.push(g);
    });
    if (!xgroups.length) {
      return cb(data);
    }
    var me = this;
    [
      function(next) {
        me.src.db
          .collection("groups")
          .find(
            {
              _id: { $in: data.xgroups }
            },
            {
              //modelaccess:1,
              //pagesaccess: 1,
              //code:1
            }
          )
          .toArray(function(e, d) {
            if (d && d.length) next(d);
            else cb(data);
          });
      },
      function(xgroups) {
        data.xgroups = xgroups;
        xgroups.each(function(grp) {
          if (grp && grp.modelaccess)
            for (var i in grp.modelaccess) {
              if (data.group.modelaccess[i])
                data.group.modelaccess[i] = me.apllyXPermissions(
                  data.group.modelaccess[i],
                  grp.modelaccess[i]
                );
              else data.group.modelaccess[i] = grp.modelaccess[i];
            }
          if (grp && grp.pagesaccess)
            for (var i in grp.pagesaccess) {
              if (data.group.pagesaccess[i])
                data.group.pagesaccess[i] = me.apllyXPermissions(
                  data.group.pagesaccess[i],
                  grp.pagesaccess[i]
                );
              else data.group.pagesaccess[i] = grp.pagesaccess[i];
            }
        });
        cb(data);
      }
    ].runEach();
  },

  apllyXPermissions: function(curData, xData) {
    var me = this;
    if (!curData) curData = {};
    for (var i in xData) {
      if (curData[i] && Ext.isObject(curData[i]))
        curData[i] = me.apllyXPermissions(curData[i], xData[i]);
      else if (xData[i] === true || xData[i] === "on") curData[i] = true;
    }
    return curData;
  }
});
