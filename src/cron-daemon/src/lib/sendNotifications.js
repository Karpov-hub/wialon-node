import Queue from "@lib/queue";

const time = "*/5 * * * * *";
const description = "Send next alarm notification";

async function run() {
  Queue.newJob("notifications-service", {
    method: "sendQueue"
  });
}

export default {
  time,
  description,
  run
};
