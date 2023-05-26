exports.port = 8008;
exports.apiVersion = "0.1.0";

exports.queueTimeout = 6000;
exports.queueName = "wialon";

exports.nats = {
  servers: "nats://localhost:4222",
  json: true
};

exports.upload_dir = __dirname + "/../../../upload";
exports.custom_reports_dir = __dirname + "/../../../reports";
exports.preset_reports_dir = __dirname + "/../../../preset_reports";

exports.DOWNLOAD_DOMAIN = "http://localhost:8012/";
exports.REDIRECT_DOMAIN = "http://localhost:8080/";
exports.weather_api_key = "517448651481bd295a0a58ed0eb23957";

exports.CLOG = ""; //"/home/maxim/app/log.txt";

exports.MAX_PREVIEW_TABLE_LENGTH = 50;

exports.log = {
  folder: "internal", // Internal - store log folder inside project root. External - in the project's parent folder.
  storagePeriod: "30d", // Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. It uses auditFile to keep track of the log files in a json format. It won't delete any file not contained in it. It can be a number of files or number of days (default: null)
  fileMaxSize: "1m", // Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
  transports: {
    file: false,
    graylog: false,
    mongo: false
  },
  consoleLogLevel: "http"
};

exports.REPORT_REQ_EMAIL_TO = "id102@tadbox.com";

exports.sendNotifications = false;

exports.DEFAULT_HOST = "https://hst-api.wialon.com/wialon/ajax.html?";
exports.DEFAULT_HOST_WITHOUT_AJAX = "https://hst-api.wialon.com";
exports.REPORT_REQ_EMAIL_CC = "id102@tadbox.com";
exports.LOCAL_PARAMETER_FOR_SALT = "zYX#Rh5V29@D";
exports.jasperURL = "http://3.6.37.236:6543";
