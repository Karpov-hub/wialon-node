import axios from "axios";
import config from "@lib/config";
import dotenv from "dotenv";
dotenv.config({ path: "../../../../.env" });

const connectionError = "TG_ALARM_FAILED";

const emoji = {
  error: "🔴",
  warn: "🟡",
  http: "🔵",
  info: "🟢"
};

function format(data) {
  const text = `${emoji[data.level]} *${process.env.NODE_ENV ||
    "development"} [${data.level}]* at _${data.timestamp}_.
  \`${data.message}\`${
    data.details
      ? `
    Details: \`${JSON.stringify(data.details)}\``
      : ``
  }${
    data.process
      ? `
   *Process:* ${data.process}`
      : ""
  }${
    data.method
      ? `
   *Method:* ${data.method}`
      : ""
  }`;
  return text;
}

async function send(data) {
  const text = format(data);
  const url = ["staging", "production"].includes(process.env.NODE_ENV)
    ? `https://api.telegram.org/bot${process.env.TELEGRAM_ALARM_BOT_TOKEN}/sendMessage`
    : "http://localhost:8015/tg_alarm_bot";
  const res = await axios({
    url,
    method: "post",
    data: {
      chat_id: "-1001751007521",
      text,
      parse_mode: "Markdown"
    }
  });
  if (res && res.data && res.data.ok === true) return true;
  throw new Error("Unsuccessful Telegram notification");
}

export default {
  send
};
