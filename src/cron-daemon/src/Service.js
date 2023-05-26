import Base from "@lib/base";
import { CronJob } from "cron";
import Jobs from "./lib";

export default class Service extends Base {
  publicMethods() {
    return {};
  }
  async run() {
    await this.pushPermissions();
    await this.subscribe();
    this.jobs = {};

    await this.createJobs();
    await this.startJobs();
  }

  createJobs() {
    Object.keys(Jobs).forEach(jobName => {
      console.log("@@Service createJobs jobName ="+jobName);
      this.jobs[jobName] = new CronJob(Jobs[jobName].time, () => {        
        this.runJob(Jobs[jobName]);
      });
    });
  }

  async runJob(jobInstance) {
    await jobInstance.run();
  }

  startJobs() {
    Object.keys(this.jobs).forEach(jobName => {
      console.log("@@Service startJobs jobName ="+jobName);
      this.jobs[jobName].start();
    });
  }

  stopJobs() {
    Object.keys(this.jobs).forEach(jobName => {
      console.log("@@@@@@@@@@@@Service stopJobs jobName ="+jobName);
      this.jobs[jobName].stop();
    });
  }

  stopJob(name) {
    this.jobs[name].stop();
  }

  startJob(name) {
    this.jobs[name].start();
  }
}