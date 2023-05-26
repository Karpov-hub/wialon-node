/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */

Ext.define("Crm.modules.messages.model.MessagesModel", {
  extend: "Core.data.DataModel",
  collection: "messages",
  removeAction: "remove",
  fields: [
    {
      name: "_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "owner",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: false
    },
    {
      name: "ctime",
      type: "string",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "subject",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "body",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "new",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fromuser",
      type: "string",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "touser",
      type: "array",
      itemsType: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "to_name",
      type: "array",
      visible: true,
      filterable: true,
      editable: true
    }
  ],

  /* scope:client */
  markAsRead: function(_id, cb) {
    this.runOnServer("markAsRead", { _id: _id }, cb);
  },

  /* scope:client */
  getNewMessagesCount: function(cb) {
    this.runOnServer("getNewMessagesCount", {}, function(res) {
      cb(res && res.count ? res.count : 0);
    });
  },

  /* scope:server */
  $getNewMessagesCount: function(data, cb) {
    this.dbCollection
      .find({ owner: this.user.id, new: true })
      .count(function(e, c) {
        cb({ count: c });
      });
  },

  /* scope:server */
  getData(params, callback) {
    if (
      params.filters &&
      Ext.isArray(params.filters) &&
      params.filters[0] &&
      params.filters[0].property == "_id"
    ) {
      this.callParent(arguments);
      return;
    }
    let box = "inbox";

    if (params._filters)
      params._filters.forEach(function(f) {
        if (f._property == "box") {
          box = f._value;
        }
      });

    if (!params.filters) params.filters = [];

    if (box == "inbox") {
      params.filters.push({ property: "touser", value: this.user.id });
    } else {
      params.filters.push({ property: "maker", value: this.user.id });
    }
    this.callParent(arguments);
  },

  /*
  buildWhere: function(params, callback) {
    if (
      params.filters &&
      Ext.isArray(params.filters) &&
      params.filters[0] &&
      params.filters[0].property == "_id"
    ) {
      this.callParent(arguments);
      return;
    }
    var out = {
        owner: this.user.id
      },
      box = "inbox",
      $or;

    if (params.filters && Ext.isArray(params.filters)) {
      params.filters.forEach(function(f) {
        if (f._property == "box") {
          box = f._value;
        }
      });
      params.filters.forEach(function(f) {
        if (f._property == "query") {
          var val = new RegExp(f._value);
          $or = [{ subject: val }];
          if (box == "inbox") {
            $or.push({ to_name: val });
          } else {
            $or.push({ fromuser: val });
          }
        }
      });
    }
    if (box == "inbox") {
      out.touser = this.user.id;
    } else {
      out.maker = this.user.id;
    }
    if ($or) out.$or = $or;

    callback(out);
  },
  */

  /* scope:server */
  $markAsRead: function(data, cb) {
    var me = this;
    this.dbCollection.update(
      {
        _id: this.db.fieldTypes.ObjectID.getValueToSave(null, data._id)
      },
      { $set: { new: false } },
      { upsert: true },
      function(e, d) {
        me.changeModelData(Object.getPrototypeOf(me).$className, "markasread", {
          touser: [me.user.id + ""]
        });
        cb({ result: !!d });
      }
    );
  },

  /* scope:server */
  insertDataToDb: function(data, cb) {
    var me = this,
      owners = [this.user.id];

    data.to_name = [];

    data.touser.prepEach(
      function(u, nxt) {
        if (!u) {
          nxt(u);
          return false;
        }
        for (var i = 0; i < owners.length; i++) {
          if (owners[i] + "" == u + "") {
            nxt(u);
            return false;
          }
        }
        me.src.db.collection("admin_users").findOne(
          {
            _id: u
          },
          { login: 1, name: 1 },
          function(e, d) {
            if (d && !owners.includes(u)) {
              owners.push(u);
              data.to_name.push(me.buildUserName(d));
              nxt(u);
            } else {
              nxt(u);
              return false;
            }
          }
        );
      },
      function() {
        data.fromuser = me.buildUserName(me.user.profile);

        owners.prepEach(
          function(item, next) {
            data.owner = item;
            if (item + "" != me.user.id) {
              data.new = true;
              if (data._id) delete data._id;
            }

            me.dbCollection.insert(data, function(e, d) {
              if (e) cb(e, null);
              else next(item);
            });
          },
          function() {
            cb(null, [data]);
          }
        );
      }
    );
  },

  buildUserName: function(profile) {
    return profile.name
      ? profile.name + " [" + profile.login + "]"
      : profile.login;
  }
});
