import Queue from "@lib/queue";
import { log } from "@lib/log";
export default class Base {
  constructor(conf) {
    this.config = conf;
    this.triggers = [];
  }

  async run() {
    this.pushPermissions();
    this.subscribe();
  }

  async pushPermissions() {
    await this.waitGate();
    Queue.broadcastJob("pushPermissions", this.serviceDescription());
  }

  waitGate() {
    return new Promise(async (res, rej) => {
      const { result } = await Queue.newJob(
        "gate-server",
        {
          method: "getStatus",
          data: {}
        },
        10000
      );
      if (result && result.isReady) {
        return res();
      }
      setTimeout(async () => {
        await this.waitGate();
        return;
      }, 500);
    });
  }

  serviceDescription() {
    return {
      service: this.config.name,
      publicMethods: this.publicMethods()
    };
  }

  // we list public methods by default
  allPublicMethods() {
    let list = this.publicMethods();
    list.serviceDescription = {};
    list.getTriggersFromService = {};
    return list;
  }

  async runServiceMethod(data, testObj) {
    const permis = this.allPublicMethods();
    if (!!permis[data.method].method) {
      return await this.runMethodTroughTriggers(
        permis[data.method].method,
        data
      );
    }
    if (!!this[data.method]) {
      return await this.runMethodTroughTriggers(
        this[data.method],
        data,
        testObj
      );
    }
    throw "METHODNOTFOUND";
  }

  async runMethodTroughTriggers(method, data, testObj) {
    const hooks = {};

    let result = await method.call(
      this,
      data.data,
      data.realmId,
      data.userId,
      hooks,
      {
        service: this.config.name,
        method: data.method
      }
    );
    return result;
  }

  subscribe() {
    let result;
    const permis = this.allPublicMethods();

    log(`Service ${this.config.name} started...`, null, {
      process: this.config.name,
      level: "info"
    });

    Queue.subscribe(this.config.name, async (data, reply) => {
      if (!!data.method && !!permis[data.method]) {
        try {
          result = await this.runServiceMethod(data);
          Queue.publish(reply, { result });
        } catch (e) {
          if (e)
            log(e.message || e, null, {
              process: this.config.name,
              level: "error",
              stack: e.stack
            });
          Queue.publish(reply, { error: e });
        }
      }
    });
    Queue.subscribe("broadcast-request", async (data, reply) => {
      if (!!data.method && !!permis[data.method] && !!this[data.method]) {
        try {
          result = await this.runServiceMethod(data);
          Queue.publish(reply, result);
        } catch (e) {
          Queue.publish(reply, { error: e });
        }
      }
    });
  }
}
