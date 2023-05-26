# Notifications service

The service is created to track and notify the developers about any significant events in the system. 

Notification scheme is pretty configurable and fluent. Currently, there are 2 notification channels: email and telegram group.

The service works and depends on @lib/log library. If any message is passed to the log, the notification service automatically catches and proceeds to work on it, according to the next algorythm:
- only if config.sendNotifications is set up to true for the current environment, the script proceeds. Currently it is on for: localtest, test, staging, production.
- script checks the notifications object, grabbed on start from the "notifications" DB table. It looks up for the matchings in it against:
  - log level (if it's not set up in the notification entry, any level matches)
  - search RegExp pattern against log message
- if log matches, the notification will be added to the notification queue for the defined channel.
- the log with the same message won't be added to queue for the next defined period (5 mins by default, but it can be set up separately for each notification pattern).

The cron job is set up to grab and send one notification for each channel for the defined period (currently, it's each 5 sec). 

If the message is failed to send, the notification provider becomes blocked for the next defined period (1h). In this case, no any notification in queue will be lost, and all of the them will be delivered once the channel will start to work for us again. 

Current setup for the notifications patterns.
- notification by Telegram with any "error" log level entry
- notification by Telegram with any http request, containing an error
- notification by email, in case if it's failed to deliver the notification with Telegram. 

## Todos

We need to add an admin module to operate on the notification patterns and notifications queue.