import WebSocket from "ws";
import querystring from "querystring";
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";

export default class WsServer {
  constructor(server) {
    this.server = server;
    this.connection();
    this.subscribeMQ();
  }

  subscribeMQ() {
    Queue.subscribe("broadcast-request", (data) => {
      if (data.method == "runOnClient") {
        this.onJob(data);
      }
    });
  }

  onJob(data) {
    if (!!this.connections_pull[data.data.userId]) {
      this.connections_pull[data.data.userId].send(JSON.stringify(data));
    }
  }

  connection() {
    this.wss = new WebSocket.Server({
      server: this.server,
      clientTracking: true
    });

    this.connections_pull = {};

    this.wss.on("connection", async (ws, req) => {
      const user_id = await this.getUserIdFromRequest(ws, req);

      if (user_id && user_id.length > 0) {
        this.connections_pull[user_id] = ws;

        const interval = setInterval(() => {
          this.wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
          });
        }, 30000);

        ws.isAlive = true;

        ws.on("pong", () => {
          ws.isAlive = true;
        });

        ws.on("close", () => {
          clearInterval(interval);
          delete this.connections_pull[user_id];
        });
      } else {
        ws.close();
      }
    });
  }

  async getUserIdFromRequest(ws, req) {
    const queryParams = req.url.split("?");
    if (!queryParams.length || queryParams.length < 2) ws.close();

    let incomingParams = querystring.parse(queryParams[1]);

    return await MemStore.get("usr" + incomingParams["token"]);
  }
}
