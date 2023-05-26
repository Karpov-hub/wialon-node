import db from "@lib/db";
import Queue from "@lib/queue";

export default class Server {
  static async getServerPermissions(data) {
    return {
      data: [
        {
          servicename: "auth-service",
          methods: ["permissedMethod", "getPublicMethods"]
        }
      ]
    };
  }

  static async permissedMethod() {
    return { authorized: true };
  }

  static async getServerByToken(data) {
    const res = await db.realm.findOne({
      where: { token: data.token },
      attributes: ["id", "permissions", "ip"],
      raw: true
    });
    return res ? res : null;
  }

  static async getPublicMethods() {
    const results = await Queue.broadcastJob("serviceDescription");
    let data = {};
    results.forEach((service) => {
      if (!service || !service.service || !service.publicMethods) return;
      data[service.service] = service.publicMethods;
    });
    return { data };
  }
}
