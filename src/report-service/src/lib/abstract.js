import Service from "./service";
import xlsx from "excel4node";
import commonMethods from "./common-methods";
import { WialonErrorCodes } from "@lib/utils";

export default class Abstract {
  constructor(accountId, realmId, userId) {
    this.accountId = accountId;
    this.realmId = realmId;
    this.userId = userId;
    this.cpuTime = 0;
    this.loginData = null;
    this.organizationId = null;
    this.reportStat = null;
  }

  async run(requestOpt) {
    const opt = await this.getAccount(this.accountId);
    this.organizationId = opt.organization_id;
    await this.insertDataInReportStat(requestOpt);

    try {
      await this.serviceStart(opt);
      const startUsage = process.cpuUsage();
      const data = await this.getData(requestOpt);
      this.xlsx = xlsx;
      this.wb = new xlsx.Workbook();
      this.make(data);

      this.cpuTime = process.cpuUsage(startUsage).system;
      // - this.service.waitingTime;
      const out = await this.createFile();
      await this.updateDataInReportStat(out);
      return out;
    } catch (e) {
      var errorData = {};
      if (e.message.includes("API error:")) {
        var messageArray = e.message.split(" ");
        var errorCode = messageArray.pop();
        var error = WialonErrorCodes.errorCodes.find(
          (error) => error.code == errorCode
        );
        errorData = error;
      } else {
        errorData.message = e.message;
        errorData.code = 0;
      }
      commonMethods.updateReportStats(this.reportStat, errorData, "error");
    }
  }

  async insertDataInReportStat(requestOpt) {
    var reportStatData = {
      organization_id: this.organizationId,
      user_id: this.userId,
      route_id: requestOpt.routeId,
      provider_id: null,
      report_generation_time: 0,
      report_size: 0,
      report_params: JSON.stringify(requestOpt),
      status: 0
    };
    this.reportStat = await commonMethods.insertInReportStats(reportStatData);
    return true;
  }

  async updateDataInReportStat(out) {
    await commonMethods.updateReportStats(
      this.reportStat,
      {
        sizeOfDataFromWialon: this.service.totalDownloaded,
        diff: this.cpuTime,
        code: out.code
      },
      "success"
    );
  }

  async serviceStart(opt) {
    const cfg = {};
    //if (opt.wialon_username) cfg.login = opt.wialon_username;
    try {
      if (opt.wialon_token) cfg.token = opt.wialon_token;
      const url = opt.wialon_hosting_url + "/wialon/ajax.html";
      this.service = new Service(url);
      this.loginData = await this.service.start(cfg);
    } catch (e) {
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

  async getAccount(accountId) {
    return {};
  }

  async getData() {
    return null; //await this.service.request(requestOpt.uri, requestOpt.opt);
  }

  async createFile() {
    const fileName = this.getFileName();
    let data = await this.wb.writeToBuffer();
    return {
      fileName,
      data
    };
  }

  addWorksheet(title) {
    return this.wb.addWorksheet(title);
  }

  createStyle(style) {
    return this.wb.createStyle(style);
  }
}
