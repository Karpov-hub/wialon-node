import Base from "@lib/base";

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
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return { "test-pong": true };
  }
}
