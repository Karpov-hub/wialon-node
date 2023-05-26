exports.custom_reports_dir = "/home/user2/reports";
exports.upload_dir = "/home/user2/upload";
exports.preset_reports_dir = "/home/user2/preset_reports";

exports.dockerd_config = { host: "http://135.181.45.161", port: 2375 };

exports.nats = {
  servers: ["nats://172.21.0.6:4222"],
  json: true
};

exports.redis = {
  host: "172.21.0.5"
};

(exports.DOWNLOAD_DOMAIN = "https://api-repogen.getgps.pro/"),
  (exports.REDIRECT_DOMAIN = "https://repogen.getgps.pro/"),
  (exports.weather_api_key = "517448651481bd295a0a58ed0eb23957");

exports.CLOG = "/app/log.txt";

exports.log = {
  folder: "external", // Internal - store log folder inside project root. External - in the project's parent folder.
  storagePeriod: "30d", // Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. It uses auditFile to keep track of the log files in a json format. It won't delete any file not contained in it. It can be a number of files or number of days (default: null)
  fileMaxSize: "1m", // Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
  transports: {
    file: true,
    graylog: false,
    mongo: true
  }
};

exports.REPORT_REQ_EMAIL_TO = "repogen@getgps.pro";
exports.REPORT_REQ_EMAIL_CC = "id102@tadbox.com";

exports.sendNotifications = true;
exports.LOCAL_PARAMETER_FOR_SALT =
  process.env.PRODUCTION_LOCAL_PARAMETER_FOR_SALT;
