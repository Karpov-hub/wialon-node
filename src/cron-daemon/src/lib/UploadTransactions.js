import Queue from "@lib/queue";

const time = "0 0 3 * * *";
const description = "Daily upload transactions to the WH";

// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11 (Jan-Dec)
// Day of Week: 0-6 (Sun-Sat)

async function run() {
  console.info(
    "CRONJOB TO UPLOAD FUC TRANSACTIONS STARTED",
    new Date().toISOString()
  );
  try {
    const { result } = await Queue.newJob("wialon-units-service", {
      method: "uploadTransactions",
      data: {}
    });
    if (result && result.transaction_counter) {
      console.info(`WERE UPLOADED ${result.transaction_counter} TRANSACTIONS`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    console.info(
      "CRONJOB TO UPLOAD FUC TRANSACTIONS FINISHED",
      new Date().toISOString()
    );
  }
}
export default {
  time,
  description,
  run
};
