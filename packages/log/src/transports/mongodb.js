import Transport from "winston-transport";
import { MongoClient, ServerApiVersion } from "mongodb";
import Queue from "@lib/queue";
require("dotenv").config({ path: "../../.env" });

const uri = process.env.LOG_MONGO_URI;

const client = uri ? new MongoClient(uri) : null;
const database = uri ? client.db("tadbox") : null;
const logCollection = uri ? database.collection("log") : null;

module.exports = class MongoTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    const doc = {
      level: info.level,
      ...info.message
    };
    try {
      await client.connect();
      await logCollection.insertOne(doc);
    } catch (e) {
      Queue.broadcastJob("onLogMongoConnectionFail", {
        error: e.stack || e.message || e
      });
      Queue.publish("alarm", {
        level: "error",
        message: "Log Mongo error",
        details: e.stack || e.message || e
      });
    } finally {
      // await client.close();
    }
    callback();
  }
};
