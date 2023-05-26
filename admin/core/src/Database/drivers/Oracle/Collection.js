/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Database.drivers.Oracle.Collection
 * @extend: Database.drivers.Mysql.Collection
 * The connector to Oracle database, Collection class
 */
//require("long-stack-traces");

Ext.define("Database.drivers.Oracle.Collection", {
  extend: "Database.drivers.Mysql.Collection",

  prepRowNames: function(row) {
    var out = {};
    for (var i in row) {
      out[i.toLowerCase()] = row[i];
    }
    return out;
  },

  query: function(cfg, callback) {
    var me = this,
      opType = cfg.type;

    if (!cfg.table) cfg.table = this.collection;

    var res,
      me = this;

    if (cfg.type == "delete") {
      cfg.type = "select";
      res = this.db.queryBuild(cfg);
      res.query = res.query.replace("select *", "delete");
    } else {
      res = this.db.queryBuild(cfg);
    }

    if (opType != "select") {
      res.values.each(function(v) {
        if (Ext.isObject(v)) return JSON.stringify(v);
        return v;
      }, true);

      this.db.conn.execute(
        res.query,
        res.values,
        { autoCommit: true },
        function(err, result) {
          if (err) {
            if (me.db.debug) {
              console.log("res:", res);
              console.log("error:", err);
              console.trace();
              //throw new Error('Oracle');
            }
            if (!!callback) callback(err);
            return;
          }
          if (!!callback) {
            callback(null, result);
          }
        }
      );
      return;
    }

    this.db.query(res.query, res.values, callback);
  }
});
