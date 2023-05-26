import Service from "./Service";
import { capture } from "@lib/log";
capture();
const service = new Service({ name: "report-service" });
service.run();
