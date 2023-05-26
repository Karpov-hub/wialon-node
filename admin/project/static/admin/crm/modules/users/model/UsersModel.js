/**
 * @author Max Tushev
 * @scope Server, Client
 * The model for Users module
 * @private
 */
Ext.define("Crm.modules.users.model.UsersModel", {
  extend: "Core.data.DataModel",
  collection: "admin_users",

  fields: [
    {
      name: "_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "login",
      type: "string",
      filterable: true,
      unique: true,
      editable: true,
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      vtype: "email",
      editable: true,
      visible: true
    },
    {
      name: "dblauth",
      type: "boolean",
      editable: true,
      visible: false
    },
    {
      name: "pass",
      type: "password",
      editable: true,
      visible: true
    },
    {
      name: "groupid",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "xgroups",
      type: "array",
      filterable: true,
      editable: true,
      visible: true,
      itemsType: "string"
    },
    {
      name: "tel",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ip",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "state",
      type: "int",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    }
  ],

  //@author: Vaibhav Mali Date: 26 May 2019.
  /* scope:server */
  getRealmsManager: function(cb) {
    var me = this,
      GroupModel = Ext.create("Crm.modules.users.model.GroupsModel", {
        scope: me
      });
    GroupModel.dbCollection.findOne(
      { code: "REALMS_MANAGERS" },
      { _id: 1 },
      cb
    );
  },

  //@author: Vaibhav Mali Date: 03 April 2018
  getData: function(params, cb) {
    var me = this,
      groupFlag = false,
      groupindex = 0,
      grpSql = "",
      tempSql = " removed=0",
      queryFlag = false,
      queryIndex = 0,
      querySql = "";
    var localFieldSet = ["login", "name", "email", "groupid", "tel"],
      preSql = " admin_users ";
    var sqlplaceholders = [],
      sql = "select * from ";
    var countSql = "select count(*) from ";
    var offsetSql =
      " offset " +
      parseInt(params._start) +
      " rows fetch next " +
      parseInt(params._limit) +
      " ROWS ONLY ";
    if (params && params._filters && params._filters.length > 0) {
      for (var i = 0; i < params._filters.length; i++) {
        if (params._filters[i]._property == "query") {
          queryFlag = true;
          queryIndex = i;
          for (var j = 0; j < localFieldSet.length; j++) {
            if (localFieldSet[j] != "groupid") {
              if (j > 0 && querySql != "") querySql += " OR ";
              querySql +=
                localFieldSet[j] +
                " ilike '%" +
                params._filters[i]._value +
                "%' ";
            }
          }
          break;
        } else if (params._filters[i]._property == "groupid") {
          groupFlag = true;
          groupindex = i;
        } else if (params._filters[i]._property == "_id")
          tempSql +=
            " and " +
            params._filters[i]._property +
            "='" +
            params._filters[i]._value +
            "' ";
        else
          tempSql +=
            " and " +
            params._filters[i]._property +
            " ilike '%" +
            params._filters[i]._value +
            "%' ";
      }
      if (queryFlag || groupFlag) {
        if (queryFlag)
          grpSql =
            "select _id,name from groups where name ilike '%" +
            params._filters[queryIndex]._value +
            "%'";
        else
          grpSql =
            "select _id,name from groups where name ilike '%" +
            params._filters[groupindex]._value +
            "%'";
        me.src.db.query(grpSql, [], function(e, resData) {
          preSql += " where ";
          if (queryFlag) preSql += "(";
          if (resData.length > 0) {
            preSql += "groupid in (";
            for (var i = 0; i < resData.length; i++) {
              sqlplaceholders.push(resData[i]._id);
              preSql += "$" + sqlplaceholders.length;
              if (resData.length > sqlplaceholders.length) preSql += ",";
            }
            preSql += queryFlag ? ") OR " : "";
          }
          if (groupFlag && !queryFlag) preSql += ") AND ";
          preSql += queryFlag ? querySql + ") AND removed=0" : tempSql;
          countSql += preSql;
          preSql += offsetSql;
          sql += preSql;
          me.src.db.query(countSql, sqlplaceholders, function(e, countData) {
            me.src.db.query(sql, sqlplaceholders, function(e, res) {
              return cb({
                list: res || [],
                total:
                  countData && countData[0] && countData[0].count
                    ? parseInt(countData[0].count)
                    : 0
              });
            });
          });
        });
      } else me.callParent(arguments);
    } else me.callParent(arguments);
  },

  /* scope:client */
  checkUnicLogin: function(data, cb) {
    this.runOnServer("checkUnicLogin", data, cb);
  },

  /* scope:server */
  $checkUnicLogin: function(data, cb) {
    var me = this;
    if (data._id && data.login) {
      me.dbCollection.findOne(
        {
          login: data.login,
          _id: {
            $ne: me.src.db.fieldTypes.ObjectID.getValueToSave(me, data._id)
          }
        },
        { _id: 1 },
        function(e, d) {
          cb({ isset: !!d && d._id });
        }
      );
    }
  },

  /* scope:server */
  changeUserState: function(_id, state, cb) {
    var me = this;
    [
      function(next) {
        if (Ext.isString(_id)) {
          me.src.db.fieldTypes.ObjectID.getValueToSave(
            me,
            _id,
            null,
            null,
            null,
            function(id) {
              _id = id;
              next();
            }
          );
        } else next();
      },
      function(next) {
        me.src.db
          .collection(me.collection)
          .findOne({ _id: _id }, { _id: 1, login: 1 }, function(e, u) {
            if (u) {
              next(u);
            }
          });
      },
      function(user) {
        me.src.db
          .collection(me.collection)
          .update({ _id: user._id }, { $set: { state: state } }, function(
            e,
            u
          ) {
            user.state = state;
            me.changeModelData(
              Object.getPrototypeOf(me).$className,
              "changeState",
              user
            );
            cb();
          });
      }
    ].runEach();
  },
  /* scope:client */
  getUserModels: function(cb) {
    this.runOnServer("getUserModels", {}, cb);
  },
  /* scope:server */
  $getUserModels: function(data, cb) {
    var me = this;

    [
      function(next) {
        me.dbCollection.findOne(
          {
            _id: me.user.id
          },
          { _id: 1, superuser: 1, groupid: 1, xgroups: 1 },
          function(e, d) {
            if (d) {
              if (d.superuser) cb({ superuser: true });
              else next(d);
            } else cb({});
          }
        );
      },
      function(u) {
        u.xgroups = u.xgroups || [];
        u.xgroups.push(u.groupid);
        me.src.db
          .collection("groups")
          .find({ _id: { $in: u.xgroups } }, {})
          .toArray(function(e, d) {
            var out = {};
            d.each(function(item) {
              for (var i in item.modelaccess) {
                if (!out[i]) {
                  var k = me.getViewClassName(i);
                  if (k != undefined) {
                    out[k] = item.modelaccess[i];
                  }
                } else {
                  for (var j in item.modelaccess[i]) {
                    if (item.modelaccess[i][j]) {
                      out[i][j] = true;
                    }
                  }
                }
              }
            });

            cb({ permissions: out });
          });
      }
    ].runEach();
  },

  getViewClassName: function(model) {
    //Vaibhav Vaidya, 4th Sept 2019, Extend current scope to all created models, Add try/catch condition.
    var me = this;
    try {
      var m = Ext.create(model.replace(/-/g, "."), { scope: me });
      //End edit for Vaibhav Vaidya, 4th Sept 2019
      m.src = {};
      var res = m.viewClassName || model;
      m.destroy();
      return res;
    } catch (e) {
      console.log(
        "IMP! Func:getViewClassName. Failed to initalize model",
        e.message
      );
      return;
    }
  },

  /* scope:client */
  checkspecialViewPermission: function(data, cb) {
    this.runOnServer("checkspecialViewPermission", data, cb);
  },
  /* scope:server */
  $checkspecialViewPermission: function(view, cb) {
    var me = this;

    //Vaibhav Vaidya, 19 April 2019, Set empty default arrays to avoid crash
    if (this.config.notPermitedViews == undefined)
      this.config.notPermitedViews = [];
    if (this.config.specialpermittableViews == undefined)
      this.config.specialpermittableViews = {};

    var notBranchPermission = this.config.notPermitedViews.filter(function(v) {
      return v == view.view ? true : false;
    });
    if (notBranchPermission && notBranchPermission.length) {
      cb(false);
    } else {
      if (
        this.config.specialpermittableViews &&
        this.config.specialpermittableViews[view.view]
      ) {
        var permission = this.config.specialpermittableViews[view.view].filter(
          function(r) {
            return r.toString().replaceAll("+", "-") == me.user.id
              ? true
              : false;
          }
        );
        cb(permission && permission.length ? true : false);
      } else {
        cb(true);
      }
      // var permission=me.config.permissionsIds.filter(function(r){
      //     return (r==me.user.id)?true:false;
      // })
      // cb((permission&&permission.length)?true:false)
    }
  },

  //@author: Vaibhav Mali Date: 26 May 2019.
  /* scope:server */
  buildWhere: function(params, cb) {
    var me = this,
      args = arguments;
    var find = {};
    [
      function(next) {
        me.getRealmsManager(function(err, role) {
          if (role) {
            find.groupid = { $ne: role._id };
          }
          next();
        });
      },
      function(next) {
        me.db.buildWhere(params, me, function(where) {
          next(where);
        });
      },
      function(where) {
        Ext.apply(find, where);
        cb(find);
      }
    ].runEach();
  }
});
