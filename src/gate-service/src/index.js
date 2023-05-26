import config from "@lib/config";
import express from "express";
import bodyParser from "body-parser";
import Server from "./lib/Server";
import WsServer from "./lib/WsServer";
import cors from "cors";
import { capture } from "@lib/log";
capture();

const app = express();

app.use(cors());

app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

app.use(new Server());

if (
  !process.env.NODE_ENV ||
  !["test", "localtest"].includes(process.env.NODE_ENV)
) {
  const server = app.listen(config.port, () => {
    console.log("server is running at %s", server.address().port);
    new WsServer(server);
  });
}

export default app;
