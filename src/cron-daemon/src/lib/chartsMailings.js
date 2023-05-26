import Queue from "@lib/queue";

// import { _sheduledMailings } from "../../../charts-service/src/lib/wialon";

const time = "0 * * * *";
const description = "Hourly sending the charts reports";

async function run() {
  // _sheduledMailings();
  return await Queue.newJob("charts-service", {
    method: "scheduled_mailings"
  });
}

export default {
  time,
  description,
  run
};
