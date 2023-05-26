var Server = require("./core"),
  //,argv = require('minimist')(process.argv.slice(2))
  cfg = require(__dirname + "/project/config.json"),
  servConf = cfg.server || {
    logs_file: "./daemon.log",
    process_name: "janusjs",
    num_workers: 1,
    checker_timeout: 1000,
    port: 4848,
    serverName: "localhost",
    nameSpace: "Crm"
  };

servConf.module = __dirname + "/project";

var config = {
  defaults: {
    port: 8008,
    staticDir: "static",
    protectedDir: "protected"
  },
  projects: [servConf]
};

Server.serve(config);
