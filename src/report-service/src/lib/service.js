import Wialon from "wialon";

export default class Service {
  constructor(url) {
    this.session = Wialon({ url }).session;
    this.totalDownloaded = 0;
    this.waitingTime = 0;
  }

  async start(opt) {
    try {
      const lang = process.env.lang ? process.env.lang.toLowerCase() : "en";
      this.conn = await this.session.start(opt);
      await this.setLocale(lang);
      return this.conn;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async setLocale(lang = "en") {
    const setLocaleParams = {
      tzOffset: this.conn.user.prp.tz,
      language: lang,
      flags: "256",
      formatDate: "%Y-%m-%E %H:%M:%S",
    };
    await this.request("render/set_locale", setLocaleParams);
  }

  async request(uri, params) {
    try {
      let sTime = Date.now();
      const res = await this.session.request(uri, params);
      this.waitingTime += Date.now() - sTime;
      if (res) {
        //const startUsage = process.cpuUsage();
        this.totalDownloaded += JSON.stringify(res).length;
        //this.cpuTime += process.cpuUsage(startUsage).system;
      }
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
