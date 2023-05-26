const NATS = require("nats");

Ext.define("Crm.Core.Queue", {
  constructor(config) {
    this.nats = NATS.connect(config.nats);
    this.queueName = config.queueName || "q1";
    this.timeOut = config.queueTimeout || 5000;
  },

  requestOne(job, data) {
    return new Promise((resolve, reject) => {
      this.nats.requestOne(
        job,
        data,
        { queue: this.queueName },
        this.timeOut,
        response => {
          resolve(response);
        }
      );
    });
  },

  request(job, data, options) {
    return new Promise((resolve, reject) => {
      this.nats.request(job, data, options, response => {
        resolve(response);
      });
    });
  }
});
