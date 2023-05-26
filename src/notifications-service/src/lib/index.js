import providers from "./providers";
import db from "@lib/db";
import memstore from "@lib/memstore";
import sha256 from "sha256";
import config from "@lib/config";

let notifications = [];
const storeFolder = "alarms";
const blocksFolder = "alarms-blocks";
const blockProvider = "blk-provider";
const blockProviderDelay = 60 * 60;
const notificationDelay = 60 * 5;
const channels = ["telegram", "email"];

init();

async function init() {
  notifications = await db.notification.findAll({
    raw: true,
    mapToModel: false
  });
  return { success: true };
}

async function addToQueue(data) {
  if (!config.sendNotifications) return;

  const found = notifications.filter((n) => {
    const regexp = n.search_flags
      ? new RegExp(n.search_pattern, n.flags)
      : new RegExp(n.search_pattern);
    return regexp.test(data.message) && n.enabled;
  });

  if (found && found.length) {
    for (const notification of found) {
      if (!notification.level || notification.level === data.level)
        for (const channel of notification.channels) {
          if (channels.includes(channel)) {
            const message = {
              message: data.message,
              level: data.level,
              provider: channel,
              to: notification.receivers,
              timestamp: new Date(),
              process: data.process,
              method: data.method,
              details: data.details
            };

            const hashedMessage = sha256(JSON.stringify(data.message));
            const blockKey = `${blocksFolder}:${channel}:${hashedMessage}`;
            const isBlocked = await memstore.get(blockKey);
            if (!isBlocked) {
              await memstore.set(
                blockKey,
                true,
                notification.delay === null
                  ? notificationDelay
                  : notification.delay
              );
              await memstore.set(
                `${storeFolder}:${channel}:${hashedMessage}`,
                JSON.stringify(message)
              );
            }
          }
        }
    }
  }

  return { success: true };
}

async function sendQueue() {
  if (!config.sendNotifications) return;

  for (const provider of channels) {
    const channelBlocked = await memstore.get(`${blockProvider}:${provider}`);
    if (channelBlocked) return;
    const keys = await memstore.keys(`${storeFolder}:${provider}:*`);
    // keys.sort();
    let message = await memstore.get(keys[0]);
    if (message) {
      message = JSON.parse(message);
      try {
        await providers[provider].send(message);
        await memstore.del(keys[0]);
      } catch (e) {
        await memstore.set(
          `${blockProvider}:${provider}`,
          true,
          blockProviderDelay
        );
        throw new Error(
          `Failed to send alarm notification with ${provider}`,
          e
        );
      }
    }
  }
}

export default {
  init,
  sendQueue,
  addToQueue
};
