import redis from "ioredis";
import config from "@lib/config";

const redisClient = new redis(config.redis || null);

export default class MemStore {
  static set(key, val, ex) {
    return new Promise((resolve, reject) => {
      if (ex) {
        redisClient.set(key, val, "EX", ex, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      } else {
        redisClient.set(key, val, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      }
    });
  }
  static get(key) {
    return new Promise((resolve, reject) => {
      redisClient.get(key, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }
  static del(key) {
    return new Promise((resolve, reject) => {
      redisClient.del(key, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }
  static keys(query) {
    return new Promise((resolve, reject) => {
      redisClient.keys(query, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }

  static exists(key) {
    return new Promise((resolve, reject) => {
      redisClient.exists(key, (e, d) => {
        if (e) reject(e);
        else resolve(!!d);
      });
    });
  }

  static flushAll() {
    return new Promise((resolve, reject) => {
      redisClient.flushdb((e, d) => {
        if (e) reject(e);
        else resolve(!!d);
      });
    });
  }
}
