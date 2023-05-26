process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const config = require("config");

Object.keys(config).forEach(k => {
  exports[k] = config[k];
});
