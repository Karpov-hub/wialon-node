import Transport from "winston-transport";
import gelf from "gelf-pro";

gelf.setConfig({
  adapterName: "udp", // optional; currently supported "udp", "tcp" and "tcp-tls"; default: udp
  adapterOptions: {
    // this object is passed to the adapter.connect() method
    // common
    host: process.env.GRAYLOG_HOST, // optional; default: 127.0.0.1
    // port: 12201, // optional; default: 12201
    // udp adapter example
    protocol: "udp4" // udp only; optional; udp adapter: udp4, udp6; default: udp4
  }
});

module.exports = class YourCustomTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    const text =
      typeof info.message.message === "object"
        ? JSON.stringify(info.message.message)
        : info.message.message;

    gelf[info.message.level](text, { _: info.message });
    callback();
  }
};
