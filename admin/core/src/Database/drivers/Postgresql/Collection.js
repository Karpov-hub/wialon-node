/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Database.drivers.Oracle.Collection
 * @extend: Database.drivers.Mysql.Collection
 * The connector to Oracle database, Collection class
 */
//require("long-stack-traces");

Ext.define("Database.drivers.Postgresql.Collection", {
  extend: "Database.drivers.Oracle.Collection",

  query: function(cfg, callback) {
    //console.log('Collection.query cfg: ', cfg.condition)

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

    //console.log('Collection.query cfg: ', cfg.condition, '; res: ', res)

    if (opType != "select") {
      res.values.each(function(v) {
        //if(Ext.isObject(v)) return JSON.stringify(v)
        if (Ext.isArray(v)) return { _arr: v };
        return v;
      }, true);

      this.db.conn.query(res.query, res.values, function(err, result) {
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
      });
      return;
    }

    this.db.query(res.query, res.values, callback);
  },

  columns: function(callback) {
    this.db.conn.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
      [this.collection],
      function(e, res) {
        var out = {};
        if (res && res.rows && res.rows.length) {
          res.rows.each(function(r) {
            out[r.column_name] = r.column_name;
          });
        }
        callback(out);
      }
    );
  }
});
