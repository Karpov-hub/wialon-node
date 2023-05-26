/**
 * @author Max Tushev <maximtushev@gmail.com>
 * @class Drivers.db.Mongodb.Database
 * @extend: Drivers.db.Base
 * The connector to Mongodb database
 */

var mongo = require("mongodb");

Ext.define("Database.drivers.Mongodb.Database", {
  extend: "Database.Base",

  constructor: function(cfg) {
    this.connect(cfg, cfg.callback || null);
    this.type = "nosql";
    this.name = "mongodb";

    this.callParent(arguments);
  },

  connect: function(cfg, callback) {
    const connString = cfg.connString || `mongodb://${cfg.host}:${cfg.port}`;
    mongo.MongoClient.connect(
      connString,
      { useNewUrlParser: true },
      (e, client) => {
        this.db = client.db(cfg.db_name);
        if (!!callback) callback(this.db);
      }
    );
  },

  useDatabase: function(database, callback) {},

  close: function(callback) {
    this.db.close();
  },

  getCollections: function(callback) {
    this.db.collectionNames(callback);
  },

  collection: function(name) {
    return this.db.collection(name);
  },

  createObjectId: function(cb) {
    if (!!cb) cb(new mongo.ObjectID());
    else return new mongo.ObjectID();
  },

  getData: function(collection, find, fields, sort, start, limit, callback) {
    var me = this;

    var cursor = me.db.collection(collection).find(find, fields);
    cursor.count(function(e, cnt) {
      if (cnt && cnt > 0) {
        if (limit) {
          cursor
            .sort(sort)
            .limit(limit)
            .skip(start)
            .toArray(function(e, data) {
              callback(cnt, data);
            });
        } else {
          cursor.sort(sort).toArray(function(e, data) {
            callback(cnt, data);
          });
        }
      } else {
        callback(0, []);
      }
    });
  },

  moveDocuments: function(source, target, query) {
    var dbTarget = Ext.isString(target) ? this.db.collection(target) : target,
      dbSource = Ext.isString(source) ? this.db.collection(source) : source,
      bulkInsert = dbTarget.initializeUnorderedBulkOp(),
      bulkRemove = dbSource.initializeUnorderedBulkOp(),
      x = 10000,
      counter = 0;

    dbSource.find(query).forEach(function(doc) {
      bulkInsert.insert(doc);
      bulkRemove.find({ _id: doc._id }).removeOne();
      counter++;
      if (counter % x == 0) {
        bulkInsert.execute();
        bulkRemove.execute();
        bulkInsert = dbTarget.initializeUnorderedBulkOp();
        bulkRemove = dbSource.initializeUnorderedBulkOp();
      }
    });
    bulkInsert.execute();
    bulkRemove.execute();
  }
});
