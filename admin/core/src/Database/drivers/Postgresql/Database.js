var sqlBuilder = require("json-sql");
//var mongo = require('mongodb');
const pg = require("pg");
const uuidV4 = require("uuid/v4");

/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Database.drivers.Oracle.Database
 * @extend: Database.drivers.Mysql.Database
 * The connector to Oracle database
 */
Ext.define("Database.drivers.Postgresql.Database", {
  extend: "Database.drivers.Mysql.Database",

  reconnectTimeout: 20000,

  constructor: function(cfg) {
    this.cfg = cfg;
    this.debugQuery = !!cfg.debugQuery;
    this.debug = !!cfg.debug;
    this.connect(cfg, cfg.callback);
    this.callParent();
  },

  connect: function(cfg, callback) {
    if (!cfg) return;
    var me = this;

    if (cfg.use_env_variable) {
      cfg.connectionString = process.env[cfg.use_env_variable];
    }
    const client = new pg.Client(cfg);

    client.on("error", function(err, client) {
      console.error("PG error", err.message, err.stack);
    });

    client.connect(function(e, c) {
      if (e) {
        console.log(e);
        process.exit();
      }
      me.conn = client;
      if (!!callback) callback(client);
    });
  },

  getCollections: function(callback) {
    var me = this;
    me.conn.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'   AND table_type='BASE TABLE'",
      [],
      function(err, res) {
        if (res) {
          res.rows.each(function(item) {
            return item.table_name;
          }, true);
          callback(res.rows);
        } else callback([]);
      }
    );
  },

  getPointedParams: function(o) {
    var out = [];
    var f = function(o) {
      if (Ext.isObject(o)) {
        for (var i in o) {
          if (/\./.test(i) && out.indexOf(i) == -1) {
            out.push(i);
          }
          if (Ext.isObject(o[i]) || Ext.isArray(o[i])) {
            f(o[i]);
          }
        }
      } else if (Ext.isArray(o)) {
        o.forEach(function(o) {
          f(o);
        });
      }
    };
    f(o);
    return out;
  },

  queryBuild: function(cfg) {
    if (cfg.fields && Ext.isObject(cfg.fields)) {
      var qFields = [];
      for (var i in cfg.fields) if (cfg.fields[i] == 1) qFields.push(i);
      cfg.fields = qFields;
    }

    var offset = 0,
      limit;

    if (cfg.limit) {
      limit = cfg.limit;
      delete cfg.limit;
    }
    if (cfg.offset || cfg.offset === 0) {
      offset = cfg.offset;
      delete cfg.offset;
    }
    var pointedParams = this.getPointedParams(cfg.condition);

    var res = sqlBuilder(cfg);
    //Search with ilike
    if (res.query.indexOf("like") >= 0) {
      res.query = res.query.replace(new RegExp("like", "g"), "ilike");
    }
    if (pointedParams && pointedParams.length) {
      pointedParams.forEach(function(p) {
        var x = p.split(".");
        res.query = res.query.replace(
          new RegExp(x[0] + "." + x[1], "g"),
          x[0] + "->>'" + x[1] + "'"
        );
      });
    }
    out = [];
    for (var i in res.values) {
      if (Ext.isBoolean(res.values[i])) out.push(res.values[i] ? 1 : 0);
      else out.push(res.values[i]);
    }
    var p = 1,
      i = 0;
    if (res.query.substr(0, 6) == "select") {
      res.query = res.query.replace(/(.{2}\$p[0-9]{1,})/g, function(str) {
        var opt = str.substr(0, 2);

        if (out[i] === null && opt == "= ") {
          out.splice(i, 1);
          return " IS NULL";
        }
        i++;
        return opt + "$" + p++;
      });
    } else {
      res.query = res.query.replace(/(\$p[0-9]{1,})/g, function(str) {
        return "$" + (parseInt(str.replace("$p", "")) + 1);
      });
    }

    res.query = res.query.replace(/___ =/g, " @>");

    //res.query = this.prepFieldsNamesInQuery(res.query);

    res.values = out;
    res.query = res.query.slice(0, -1);

    if (limit) {
      res.query += " LIMIT " + limit + (offset ? " OFFSET " + offset : "");
    }

    return res;
  },

  createCollection: function(collection, callback) {
    var me = this;
    [
      function(call) {
        var sql = [
          "CREATE table " + collection + " (",
          "_id        varchar(36) NOT NULL DEFAULT uuid_generate_v4(),",
          "mtime      date,",
          "ctime      date,",
          "ltime      date,",
          "stime      bigint,",
          "removed    int  NOT NULL DEFAULT 0,",
          "signobject jsonb,",
          "maker      varchar(36))"
        ].join("");
        me.conn.query(sql, [], function(e, d) {
          if (e) {
            console.log("create error:", sql);
            //me.error(e)
            call();
          } else call();
        });
      }
    ].runEach();
  },

  getData: function(collection, find, fields, sort, start, limit, callback) {
    var me = this,
      fieldsAr = [],
      cfg = {
        type: "select",
        table: collection,
        condition: find
      };

    [
      // get counts
      function(call) {
        cfg.fields = ["count(*) as cnt"];
        var res = me.queryBuild(cfg);
        me.query(res.query, res.values, function(e, data) {
          if (data && data[0] && data[0].cnt) call(data[0].cnt);
          else callback(0, []);
        });
      },

      function(total) {
        cfg.fields = fields;
        if (sort) cfg.sort = sort;
        if (limit) cfg.limit = limit;
        if (start || start === 0) cfg.offset = start;

        me.collection(cfg.collection).query(cfg, function(err, res) {
          if (me.debug && err) {
            console.log("Database getData err:", err);
            console.log("getData res:", cfg);
          }
          callback(total, res);
        });
      }
    ].runEach();
  },

  query: function(query, values, callback) {
    if (!callback) {
      return new Promise((resolve, reject) => {
        this.query_for_promise(query, values, (e, r) => {
          if (e) reject(e);
          else resolve(d);
        });
      });
    } else {
      this.query_for_promise(query, values, callback);
    }
  },

  query_for_promise: function(query, values, callback) {
    var log = setTimeout(() => {
      this.connect(this.cfg, conn => {
        this.query_do(query, values, callback);
      });
    }, this.reconnectTimeout);
    this.query_do(query, values, (err, data) => {
      if (err) {
        console.log("e:", err, query, values);
      }
      clearTimeout(log);
      callback(err, data);
    });
  },

  query_do: function(query, values, callback) {
    this.conn.query(query, values, (err, res) => {
      callback(
        err,
        res && res.rows
          ? res.rows.map(row => {
              Object.keys(row).forEach(i => {
                if (row[i] && !!row[i]._arr && Object.keys(row[i]).length == 1)
                  row[i] = row[i]._arr;
              });
              return row;
            })
          : res
      );
    });
  },

  createObjectId: function(cb) {
    if (!!cb) cb(uuidV4());
    //new mongo.BSONPure.ObjectID())
    else return uuidV4(); //new mongo.BSONPure.ObjectID();
  }
});
