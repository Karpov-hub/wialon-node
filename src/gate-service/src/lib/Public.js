import MemStore from "@lib/memstore";
import config from "@lib/config";

function getStatus(server) {
  return { isReady: server.isReady };
}

async function enableLogs() {
  let logsStatus = await MemStore.get("logs_status");
  if (logsStatus == "enabled") {
    await MemStore.set("logs_status", "disabled");
    return { logsStatus: false };
  }
  if (logsStatus == "disabled") {
    await MemStore.set("logs_status", "enabled");
    return { logsStatus: true };
  }
}

async function logsStatus() {
  let logsStatus = await MemStore.get("logs_status");
  if (logsStatus == null) await MemStore.set("logs_status", config.logs);

  return { logsStatus: !logsStatus };
}

export default {
  getStatus,
  enableLogs,
  logsStatus
};
