import chai from "chai";
let should = chai.should();
import db from "@lib/db";
import fs from "fs";

chai.use(require("chai-things"));

// import pretest from "@lib/pretest";

import ReportService from "../src/Service.js";
const reportService = new ReportService({
  name: "report-service"
});

let routeId = null;
let userId = null;
let wialonAccountIdVesta = null;
let wialonAccountIdKazan = null;
let wialonAccountIdGeneric = null;
describe("Report service", async () => {
  before(async () => {
    await db.organization.destroy({
      truncate: true,
      cascade: true
    });
    let organizationData = {
      id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      organization_name: "Anita891",
      ctime: "2020-02-17T08:28:05Z",
      mtime: "2020-02-17T08:28:05Z",
      removed: 0
    };

    let organization = await db.organization.create(organizationData);
    db.user.destroy({
      truncate: true,
      cascade: true
    });
    let userData = {
      id: "f713eac0-4261-11ea-9301-05aa7d09559e",
      name: "ab198",
      email: "ab198+1@enovate-it.com",
      pass: "ebfc7910077770c8340f63cd2dca2ac1f120444f",
      organization_id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      role_id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
      realm: "59adefc0-32a7-11ea-8c1e-ffc67778a55e",
      wialon_token: "aaaaae5242d5738fb1f28cb85da261b8b181e80080b9",
      email_verified_at: null,
      is_active: false,
      ctime: "2020-01-29T06:38:31Z",
      mtime: "2020-02-07T05:19:18Z"
    };

    let user = await db.user.create(userData);
    userId = user.id;

    db.route.destroy({
      truncate: true,
      cascade: true
    });
    await db.route.create({
      id: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
      method: "buildReport",
      service: "report-service",
      description: "",
      type: 2,
      organization_id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      requirements: null,
      removed: 0,
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    });

    let wialonAccountDataKazan = {
      id: 1,
      wialon_username: "kazan",
      wialon_token:
        "d54a6f2a1d63b62ee3d41355a52f42818F692DCCFF054EACC3F584A81FD7C6F0493D1C55",
      wialon_hosting_url: "https://hst-api.wialon.com",
      organization_id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    };
    let wialonAccountDataVesta = {
      id: 2,
      wialon_username: "vesta",
      wialon_token:
        "79c08e86c41ac4b23ae78a8a53db3c1a298C833F300707B36AE138C43E53069F62E1FDA6",
      wialon_hosting_url: "http://gps01.st-gps.ru:8025",
      organization_id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    };
    let wialonAccountDataGeneric = {
      id: 3,
      wialon_username: "generic",
      wialon_token:
        "a6a50ab724a137468c0bd8c75b1767218E431A722F86A0BECAC6F60C0ECEBF8CB1DA6CDA",
      wialon_hosting_url: "https://hst-api.wialon.com",
      organization_id: "6b7a94c0-515f-11ea-9296-8bf607b8cd59",
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    };
    db.wialon_accounts.destroy({
      truncate: true,
      cascade: true
    });
    let wialonAccountKazan = await db.wialon_accounts.create(
      wialonAccountDataKazan
    );
    let wialonAccountVesta = await db.wialon_accounts.create(
      wialonAccountDataVesta
    );
    let wialonAccountGeneric = await db.wialon_accounts.create(
      wialonAccountDataGeneric
    );
    wialonAccountIdKazan = wialonAccountKazan.id;
    wialonAccountIdVesta = wialonAccountVesta.id;
    wialonAccountIdGeneric = wialonAccountGeneric.id;
  });

  after(async () => {});

  function wait(seconds) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, seconds * 1000);
    });
  }

  describe("Test skeleton report", async () => {
    let customReportId;

    let genericCode = fs.readFileSync(
      __dirname +
        "/../../../../preset_reports/449ea2ca-0192-4ddc-a631-eb1ee763e2f4/code.js"
    );
    let vestaCode = fs.readFileSync(
      __dirname +
        "/../../../../preset_reports/57802189-f51d-4ec5-89d6-8faf3e2bf82d/code.js"
    );
    let kazanCode = fs.readFileSync(
      __dirname +
        "/../../../../preset_reports/d45185e9-5a53-4146-b657-a792f308807b/code.js"
    );
    genericCode = genericCode.toString("base64");
    kazanCode = kazanCode.toString("base64");
    vestaCode = vestaCode.toString("base64");

    it("Generic: Create Custom Report generator", async () => {
      console.log("build report");

      const res = await reportService.runServiceMethod({
        method: "buildCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          name: "generic-docker",
          description: "custom report description",
          code: genericCode
        },
        userId: userId
      });
      customReportId = res.id;
      res.should.have.deep.property("id");
    });

    it("Update Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "updateCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          id: customReportId,
          name: "generic-docker",
          description: "custom report description",
          code: genericCode
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all available reports", async () => {
      const res = await reportService.runServiceMethod({
        method: "getAllReports",
        data: {},
        userId: userId
      });

      res[0].should.have.deep.property("key");
      res[0].should.have.deep.property("name");
      res[0].should.have.deep.property("text");

      res.should.include.something.that.deep.equals({
        key: customReportId,
        type: "custom",
        name: "generic-docker",
        text: "custom report description"
      });
    });

    it("Get all reports in the process", async () => {
      const res = await reportService.runServiceMethod({
        method: "getReportsInProcess",
        data: {},
        userId: null,
        realm: null
      });

      res.should.have.deep.property("success", true);
    });

    it("Make Generic report in docker", async () => {
      const res = await reportService.runServiceMethod({
        method: "buildReport",
        data: {
          report: "custom", // report name in reports/index.js
          report_id: customReportId,
          wialonAccountId: wialonAccountIdGeneric, // account id in the database
          params: {
            routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca"
          } // filtering params (optional)
        },
        userId: userId
      });

      await wait(20);

      res.should.have.deep.property("success");
      // res.should.have.deep.property("code");
      // res.should.have.deep.property("size");
      // res.should.have.deep.property("fileName");
      // res.should.have.deep.property("cpu_status");
      // res.should.have.deep.property("memory_status");
      // res.should.have.deep.property("net_status");
    }).timeout(0);

    it("Remove Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "removeCustom",
        data: {
          id: customReportId
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Kazan: Create Custom Report generator", async () => {
      const res = await reportService.runServiceMethod({
        method: "buildCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          name: "kazan-docker",
          description: "custom report description",
          code: kazanCode
        },
        userId: userId
      });
      customReportId = res.id;
      res.should.have.deep.property("id");
    });

    it("Update Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "updateCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          id: customReportId,
          name: "kazan-docker",
          description: "custom report description",
          code: kazanCode
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all available reports", async () => {
      const res = await reportService.runServiceMethod({
        method: "getAllReports",
        data: {},
        userId: userId
      });

      res[0].should.have.deep.property("key");
      res[0].should.have.deep.property("name");
      res[0].should.have.deep.property("text");

      res.should.include.something.that.deep.equals({
        key: customReportId,
        type: "custom",
        name: "kazan-docker",
        text: "custom report description"
      });
    });

    it("Make kazan report in docker", async () => {
      const res = await reportService.runServiceMethod({
        method: "buildReport",
        data: {
          report: "custom", // report name in reports/index.js
          report_id: customReportId,
          wialonAccountId: wialonAccountIdGeneric, // account id in the database
          params: {
            routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
            startDate: "2020-02-03T06:30:00.000Z",
            endDate: "2020-02-06T06:30:00.000Z",
            unit: 18370479
          } // filtering params (optional)
        },
        userId: userId
      });
      await wait(20);
      res.should.have.deep.property("success");

      // res.should.have.deep.property("code");
      //   res.should.have.deep.property("size");
      //   res.should.have.deep.property("fileName");
      //   res.should.have.deep.property("cpu_status");
      //   res.should.have.deep.property("memory_status");
      //   res.should.have.deep.property("net_status");
    }).timeout(0);

    it("Remove Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "removeCustom",
        data: {
          id: customReportId
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Vesta: Create Custom Report generator", async () => {
      const res = await reportService.runServiceMethod({
        method: "buildCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          name: "vesta-docker",
          description: "custom report description",
          code: vestaCode
        },
        userId: userId
      });
      customReportId = res.id;
      res.should.have.deep.property("id");
    });

    it("Update Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "updateCustom",
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          id: customReportId,
          name: "vesta-docker",
          description: "custom report description",
          code: vestaCode
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all available reports", async () => {
      const res = await reportService.runServiceMethod({
        method: "getAllReports",
        data: {},
        userId: userId
      });

      res[0].should.have.deep.property("key");
      res[0].should.have.deep.property("name");
      res[0].should.have.deep.property("text");

      res.should.include.something.that.deep.equals({
        key: customReportId,
        type: "custom",
        name: "vesta-docker",
        text: "custom report description"
      });
    });

    it("Make vesta report in docker", async () => {
      const res = await reportService.runServiceMethod({
        method: "buildReport",
        data: {
          report: "custom", // report name in reports/index.js
          report_id: customReportId,
          wialonAccountId: wialonAccountIdVesta, // account id in the database
          params: {
            date: "2020-01-31",
            routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
            fromUnit: 0,
            toUnit: 2
          } // filtering params (optional)
        },
        userId: userId
      });
      await wait(50);
      res.should.have.deep.property("success");
      // res.should.have.deep.property("code");
      //   res.should.have.deep.property("size");
      //   res.should.have.deep.property("fileName");
      //   res.should.have.deep.property("cpu_status");
      //   res.should.have.deep.property("memory_status");
      //   res.should.have.deep.property("net_status");
    }).timeout(0);

    it("Remove Custom Report", async () => {
      const res = await reportService.runServiceMethod({
        method: "removeCustom",
        data: {
          id: customReportId
        },
        userId: userId
      });
      res.should.have.deep.property("success", true);
    });
  });
});
