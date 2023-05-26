/**
 * QProxy -- processor for all http requests
 */

import Request from "./Request";
import Queue from "@lib/queue";
import publicMethods from "./Public";
import config from "@lib/config";
import Validator from "./Validator";

export default class Server {
  constructor() {
    this.isReady = false;
    this.schemaValidator = Validator.schemaValidator;

    this.init();
    return (req, res, done) => {
      this.run(req, res, done);
    };
  }

  run(req, res, done) {
    // waiting for initialization
    return new Promise((resolve, reject) => {
      this.doRun(req, res, resolve, reject, done);
    });
  }

  /**
   * if initialization is required, we will
   * postpone the processing of the request
   * until the end of the init function
   **/

  doRun(req, res, resolve, reject, done) {
    if (!this.isReady) {
      setTimeout(() => {
        this.doRun(req, res, resolve, reject, done);
      }, 10);
      return;
    }
    const request = new Request(req, res, this);
    request.run().then(resolve, reject);
  }

  // After all initialization procedures, you need to set the flag this.isReady = true
  async init() {
    this.subscribe();
    await this.getServices();
    this.subscribeServicesPermissions();
    this.isReady = true;
    setInterval(() => {
      this.getServices();
    }, 20000);
  }

  getServices() {
    return new Promise((resolve) => {
      this.getServices_do((res) => {
        resolve(res);
      });
    });
  }

  prepareServices(services) {
    Object.keys(services).forEach((name) => {
      services[name] = this.exceptPrivateMethods(services[name], name);
    });
    return services;
  }

  exceptPrivateMethods(service, serviceName) {
    Object.keys(service).forEach((method) => {
      if (service[method].private) delete service[method];
      else if (service[method].schema) {
        this.addSchema(serviceName, method, service[method].schema);
      }
    });
    return service;
  }

  addSchema(serviceName, method, schema) {
    const id = "/" + serviceName + "_" + method;
    schema.id = id;
    this.schemaValidator.addSchema(schema, id);
  }

  getServices_do(cb) {
    Queue.newJob(
      "auth-service",
      {
        method: "getPublicMethods",
        data: {}
      },
      -2
    )
      .then((res) => {
        if (res === false) {
          setTimeout(() => {
            this.getServices_do(cb);
          }, 1000);
        } else {
          this.services = this.prepareServices(res.result.data);
          cb();
        }
      })
      .catch((e) => {
        setTimeout(() => {
          this.getServices_do(cb);
        }, 1000);
      });
  }

  subscribeServicesPermissions() {
    Queue.subscribe("broadcast-request", async (data, reply) => {
      if (!!data.method && data.method == "pushPermissions") {
        this.services[data.data.service] = this.exceptPrivateMethods(
          data.data.publicMethods
        );
      }
    });
  }

  subscribe() {
    Queue.subscribe(
      "gate-server",
      { queue: config.queueName },
      async (data, reply) => {
        let result;
        if (!!data.method && !!publicMethods[data.method]) {
          try {
            result = await publicMethods[data.method](this, data);
            Queue.publish(reply, { result });
          } catch (e) {
            console.log("error:(", data.method, "):", e, result);

            Queue.publish(reply, { error: e });
          }
        }
      }
    );
  }
}
