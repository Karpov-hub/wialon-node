import Service from "./Service";
import { capture } from "@lib/log";
capture();
const service = new Service({ name: "skeleton" });
service.run();
