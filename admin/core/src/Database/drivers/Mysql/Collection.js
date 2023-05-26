/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Drivers.db.Mysql.Collection
 * @extend: Drivers.db.Collection
 * The connector to MySQL database, Collection class
 */
Ext.define("Database.drivers.Mysql.Collection", {
  extend: "Database.Collection",

  query: function(cfg, callback) {
    if (!cfg.table) cfg.table = this.collection;

    var res;

    if (cfg.type == "delete") {
      cfg.type = "select";

      res = this.db.queryBuild(cfg);

      res.query = res.query.replace("select *", "delete");
    } else {
      res = this.db.queryBuild(cfg);
    }

    //console.log('res:', res)

    this.db.conn.query(res.query, res.values, function(e, result) {
      callback(e, result, res);
    });
  },

  insert: function(data, callback) {
    if (!callback) {
      return new Promise((resolve, reject) => {
        this.insert_do(data, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else this.insert_do(data, callback);
  },

  insert_do: function(data, callback) {
    var me = this,
      results = [];

    if (!Ext.isArray(data)) data = [data];

    var func = function(i) {
      if (i >= data.length) {
        callback(null, data);
        return;
      }

      me.query(
        {
          type: "insert",
          values: data[i]
        },
        function(err, result, res) {
          if (result && result.insertId) {
            data[i]._id = result.insertId;
            func(i + 1);
          } else {
            callback(err, result);
          }
        }
      );
    };
    func(0);
  },

  update: function(where, data, p1, p2) {
    let callback;
    if (!!p1 && Ext.isFunction(p1)) callback = p1;
    else if (!!p2 && Ext.isFunction(p2)) callback = p2;

    if (!callback) {
      return new Promise((resolve, reject) => {
        this.update_do(where, data, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else this.update_do(where, data, callback);
  },
  update_do: function(where, data, callback) {
    this.query(
      {
        type: "update",
        condition: where,
        modifier: data //.$set
      },
      function(e, result) {
        if (e) {
          console.log("Collection update e:", e);
          console.log("Collection update data:", data);
        }

        callback(e, result);
      }
    );
  },

  findAll: function(where, fields, callback) {
    if (!callback) {
      return new Promise((resolve, reject) => {
        this.find(where, fields, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else {
      this.find(where, fields, callback);
    }
  },

  find: function(where, fields, callback) {
    if (!!callback) {
      this.query(
        {
          type: "select",
          condition: where,
          fields: fields
        },
        function(e, result, res) {
          callback(e, result, res);
        }
      );
    } else {
      return Ext.create("Database.drivers.Mysql.Query", {
        collection: this,
        query: {
          type: "select",
          condition: where,
          fields: fields
        }
      });
    }
  },

  findOne: function(where, p1, p2) {
    let flds = Ext.isFunction(p1) ? {} : p1,
      callback = Ext.isFunction(p1) ? p1 : Ext.isFunction(p2) ? p2 : null;

    if (!callback) {
      return new Promise((resolve, reject) => {
        this.findOne_do(where, flds, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else {
      this.findOne_do(where, flds, callback);
    }
  },

  findOne_do: function(where, flds, callback) {
    this.find(where, flds, (err, result, res) => {
      if (err) callback(err);
      else if (result && result[0]) callback(null, result[0], res);
      else callback(null, null, res);
    });
  },

  remove: function(where, p1, p2) {
    let callback;
    if (!!p1 && Ext.isFunction(p1)) callback = p1;
    else if (!!p2 && Ext.isFunction(p2)) callback = p2;
    if (!callback) {
      return new Promise((resolve, reject) => {
        this.remove_do(where, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else {
      this.remove_do(where, callback);
    }
  },

  remove_do: function(where, callback) {
    this.query(
      {
        type: "delete",
        condition: where
      },
      function(e, result, res) {
        callback(e, result, res);
      }
    );
  },

  columns: function(callback) {
    this.db.conn.query("SHOW COLUMNS FROM " + this.collection, function(
      e,
      res
    ) {
      var out = {};
      if (res) {
        res.each(function(r) {
          out[r.Field] = r;
        });
      }
      callback(out);
    });
  }
});

Ext.define("Database.drivers.Mysql.Query", {
  extend: "Ext.Base",

  constructor: function(cfg) {
    Ext.apply(this, cfg);
    this.callParent();
  },

  sort: function(sorts, cb) {
    this.query.sort = sorts;
    return this;
  },

  skip: function(start, cb) {
    this.query.offset = start;
    return this;
  },

  limit: function(limit, cb) {
    this.query.limit = limit;
    return this;
  },

  toArray: function(cb) {
    var me = this;
    me.collection.query(me.query, cb);
  },

  count: function(cb) {
    this.collection.query(this.query, function(e, d) {
      cb(e, d ? d.length : null);
    });
  }
});
