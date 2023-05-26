import Service from "./Service";
import { capture } from "@lib/log";
capture();
const service = new Service({ name: "mail-service" });
service.run();
