import excelGenerator from "@lib/excel-generator";
import wialon from "@lib/wialon-platform";

export default class ReportBase {
  constructor(conf) {
    this.config = conf;
  }

  getPlatform() {
    let platform = this.platform();
    return platform;
  }

  generateExcel() {
    excelGenerator.generateXlsx(data);
  }

  async login() {
    let res = await wialon.login(token, session);
    return res;
  }

  async getSize(currentSize, data) {
    let res = await wialon.getSize(currentSize, data);
    return res;
  }

  async getAllUnits(data) {
    let res = await wialon.getAllUnits(data);
    return res;
  }
}
