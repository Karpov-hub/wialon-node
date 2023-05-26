import Queue from "@lib/queue";

// Run every day 03 am 0 3 * * *
const time = "0 3 * * *";
const description =
  "Close automatically a tickets, those have no comments more than 1 week";

async function run() {
  try {
    console.info(`@@Close Tickets stated: ${new Date().toISOString()}`);
    const { result, error } = await Queue.newJob("support-service", {
      method: "closeInactiveTickets",
      data: {}
    });
    if (error) {
      throw error;
    }
    if (result && result.success && result.count != null) {
      console.info(`@@Close Tickets. Were closed ${result.count} tickets.`);
    }
  } catch (err) {
    console.error("@@Close Tickets err = ", err);
  } finally {
    console.info(`@@Close Tickets finished: ${new Date().toISOString()}`);
  }
}

export default {
  time,
  description,
  run
};
