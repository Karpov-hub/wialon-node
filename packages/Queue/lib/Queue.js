"use strict";

const NATS = require("nats");
const config = require("@lib/config");

const nats = NATS.connect(config.nats);

module.exports = {
  newJob(name, data, timeout) {
    return new Promise((resolve, reject) => {
      if (!nats.connected) {
        setTimeout(async () => {
          const res = await this.newJob(name, data, timeout);
          resolve(res);
        }, 500);
        return;
      }
      nats.requestOne(
        name,
        data,
        { queue: config.queueName },
        timeout < 0 ? config.queueTimeout || 60000 : timeout,
        (response) => {
          if (response instanceof NATS.NatsError) {
            if (timeout == -1) return reject(response);
            if (timeout == -2) return resolve(false);
            setTimeout(async () => {
              const res = await this.newJob(name, data, timeout);
              resolve(res);
            }, config.queueTimeout || 60000);
            return;
          }
          resolve(response);
        }
      );
    });
  },
  subscribe(name, p1, p2) {
    if (!nats.connected) {
      setTimeout(() => {
        this.subscribe(name, p1, p2);
      }, 500);
      return;
    }
    if (!!p2) nats.subscribe(name, p1, p2);
    //{ queue: "q1" }
    else nats.subscribe(name, p1);
  },
  broadcastJob(method, data, timeout) {
    return new Promise((resolve) => {
      if (!nats.connected) {
        setTimeout(async () => {
          const res = await this.broadcastJob(method, data, timeout);
          resolve(res);
        }, 500);
        return;
      }
      let result = [];
      nats.request("broadcast-request", { method, data }, (response) => {
        result.push(response);
      });
      // wait a second until all services respond
      setTimeout(() => {
        resolve(result);
      }, timeout || 1000);
    });
  },
  publish(reply, data) {
    nats.publish(reply, data);
  }
};
