const Service = require("./service");
const fs = require("promise-fs");
const xlsx = require("excel4node");
const WialonErrorCodes = require("./wialon-error-codes");
const jasperConnector = require("./jasper-connector");
module.exports = class Base {
  constructor(cfg) {
    this.accountId = cfg.accountId;
    this.cfg = cfg;
    this.loginData = null;
    this.organizationId = cfg.organization_id;
    this.reportStat = null;
  }

  async run() {
    let requestOpt = {};
    const logFilePath = "/app/src/report/log.json";
    if (this.cfg.wialon_request_params) {
      try {
        requestOpt = JSON.parse(
          Buffer.from(this.cfg.wialon_request_params, "base64").toString("utf8")
        );
      } catch (e) {}
    }
    try {
      await fs.writeFile(logFilePath, JSON.stringify({}));

      await this.serviceStart();
      const data = await this.getData(requestOpt);

      let out;

      if (
        this.cfg.jasper === "true" &&
        this.cfg.jasper_code &&
        this.cfg.format &&
        this.cfg.jasper_url
      ) {
        const fileInBase64 = await jasperConnector.generateReport({
          report_name: this.cfg.jasper_code,
          report_data: data.jasperData,
          format: this.cfg.format,
          jasper_url: this.cfg.jasper_url,
          lang: this.cfg.lang || "en"
        });

        const base64Object = this.splitBase64(fileInBase64.data);

        out = fs.writeFile(
          __dirname + "/../report/results/" + this.cfg.wialon_outfile,
          base64Object.data,
          { encoding: "base64" },
          (err) => {
            if (err) {
              console.error(err);
            }
            return out;
          }
        );
      } else {
        this.xlsx = xlsx;
        this.wb = new xlsx.Workbook();
        this.make(data.xlsxData ? data.xlsxData : data);
        out = await this.createFile();
      }
      return out;
    } catch (e) {
      console.log("Error generating report: e = ", e);

      var errorData = {};
      if (e.message.includes("API error:")) {
        var messageArray = e.message.split(" ");
        var errorCode = messageArray.pop();
        var error = WialonErrorCodes.errorCodes.find(
          (error) => error.code == errorCode
        );
        errorData = error;
        // } else if (e.internal_error_code){
        //   var error = InternalErrorCodes.errorCodes.find(
        //     (error) => error.code == errorCode
        //   );
        //   errorData = error;
      } else if (
        e.message.includes("Invalid URI") ||
        e.message.includes("getaddrinfo ENOTFOUND")
      ) {
        errorData.message = e.message;
        errorData.code = 5004;
      } else if (e.message.includes("Invalid authorization parameters")) {
        errorData.message = e.message;
        errorData.code = 5005;
      } else {
        errorData.message = e.message;
        errorData.code = 0;
      }
      await fs.writeFile(logFilePath, JSON.stringify(errorData));
    }
  }

  async serviceStart() {
    const cfg = {};
    //if (opt.wialon_username) cfg.login = opt.wialon_username;
    try {
      if (this.cfg.wialon_token) cfg.token = this.cfg.wialon_token;

      const url = this.cfg.wialon_hosting_url + "/wialon/ajax.html";

      this.service = new Service(url);
      this.loginData = await this.service.start(cfg);
    } catch (e) {
      // console.log("e:", e);
      return Promise.reject(e);
    }
  }

  async callService(uri, opt) {
    try {
      return await this.service.request(uri, opt);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getData() {
    return null; //await this.service.request(requestOpt.uri, requestOpt.opt);
  }

  async createFile() {
    console.log(
      "createFile:",
      __dirname + "/../report/results/" + this.cfg.wialon_outfile
    );
    this.wb.write(__dirname + "/../report/results/" + this.cfg.wialon_outfile);
  }

  addWorksheet(title) {
    return this.wb.addWorksheet(title);
  }

  createStyle(style) {
    return this.wb.createStyle(style);
  }

  splitBase64(dataString) {
    const response = {};
    const beginTypeIndex = dataString.indexOf(":") + 1;
    const endTypeIndex = dataString.indexOf(";");
    const indexBase64 = dataString.indexOf(",") + 1;

    response.type = dataString.slice(beginTypeIndex, endTypeIndex);
    response.data = dataString.substr(indexBase64);

    return response;
  }
};
