import Queue from "@lib/queue";

function format(data) {
  const env = process.env.NODE_ENV;
  const to = data.to;
  const message = {
    lang: "en",
    code: "dev-notification",
    to,
    subject: `Repogen alarm [${env}]: ${data.message.slice(0, 64)}${
      data.message.length > 64 ? "..." : ""
    }`,
    body: {
      to,
      env,
      message: data.message,
      level: data.level,
      timestamp: data.timestamp,
      debug: data.debug,
      stack: data.stack,
      details: data.details
    }
  };
  return message;
}

async function send(data) {
  const formattedData = format(data);
  const res = await Queue.newJob("mail-service", {
    method: "send",
    data: formattedData,
    realmId: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27"
  });
  if (res && res.result && res.result.success && res.result.success === true)
    return true;
  throw new Error("Unsuccessful email notification");
}

export default {
  send
};
