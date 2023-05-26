exports.port = 3000;
exports.apiVersion = "0.0.0";
exports.nats = {
  servers: ["nats://nats:4222"],
  json: true
};
exports.redis = {
  host: "redis",
  port: 6379
};
exports.minio = {
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: "miniotest",
  secretKey: "miniotest"
};
exports.upload_dir = __dirname + "/../../../upload";
exports.custom_reports_dir = __dirname + "/../../../reports";
exports.preset_reports_dir = __dirname + "/../../../preset_reports";
exports.wialon_token =
  "21c2af11b22a73564a4ab25e78eaea1300303FD931531345F25FB813F53CF2EB7856E890";

exports.DOWNLOAD_DOMAIN = "http://serv:8012/";
exports.REDIRECT_DOMAIN = "http://localhost:8080/";
exports.weather_api_key = "517448651481bd295a0a58ed0eb23957";
exports.sendNotifications = true;
exports.wialon_hosting = "http://serv:8015";

exports.log = {
  folder: "internal", // Internal - store log folder inside project root. External - in the project's parent folder.
  storagePeriod: "30d", // Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. It uses auditFile to keep track of the log files in a json format. It won't delete any file not contained in it. It can be a number of files or number of days (default: null)
  fileMaxSize: "1m", // Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
  transports: {
    file: false,
    graylog: false,
    mongo: false
  },
  consoleLogLevel: "info"
};

exports.CHARTS_HOST = "http://serv:8015/charts";
exports.DEFAULT_HOST_WITHOUT_AJAX = "http://serv:8015/fuc";
exports.DEFAULT_HOST = "http://serv:8015/fuc/wialon/ajax.html?";
exports.REPORT_REQ_EMAIL_CC = "id102@tadbox.com";
exports.LOCAL_PARAMETER_FOR_SALT = "zYX#Rh5V29@D";
