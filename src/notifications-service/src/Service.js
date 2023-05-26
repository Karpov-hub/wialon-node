import Base from "@lib/base";
import lib from "./lib";
import Queue from "@lib/queue";
import tg from "./lib/providers/telegram";
import email from "./lib/providers/email";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      ping: {
        description: "Test ping-pong method"
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      init: {
        private: true,
        description: "(Re)initialize the notifications from the database",
        method: lib.init
      },
      sendQueue: {
        private: true,
        description: "Send next alarm notification",
        method: lib.sendQueue
      },
      addToQueue: {
        private: true,
        description: "Send next alarm notification",
        method: lib.addToQueue
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return { "test-pong": true };
  }
}

Queue.subscribe("alarm", async (data) => {
  lib.addToQueue(data);
});
