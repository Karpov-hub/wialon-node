import Service from "./Service";
import { capture } from "@lib/log";
capture();
const service = new Service({
  name: "support-service"
});
service.run();
