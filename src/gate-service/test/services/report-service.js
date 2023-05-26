import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import doc from "@lib/chai-documentator";
import excelGenerator from "@lib/excel-generator";
import fs from "fs";
import config from "@lib/config";
import { hashPassword, createSalt } from "@lib/utils";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let should = chai.should();
let userToken, invitedUserToken;
let organization_id = "6b7a94c0-515f-11ea-9296-8bf607b8cd59";
let routeId = null;
let userId = null;
let wialonAccountIdVesta = null;
let wialonAccountIdKazan = null;
let wialonAccountIdGeneric = null;

chai.use(chaiHttp);

describe("Report service methods", async () => {
  before(async () => {});

  after(async () => {
    await db.role.destroy({
      truncate: true,
      cascade: true
    });
    await db.provider.destroy({
      truncate: true,
      cascade: true
    });
    await db.Permissions.destroy({
      truncate: true,
      cascade: true
    });
    await db.route.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization.destroy({
      truncate: true,
      cascade: true
    });
    await db.user.destroy({
      truncate: true,
      cascade: true
    });
  });

  describe("Check report-generator", async () => {
    it("Check excel generating", async () => {
      let data = {
        wbName: "report.xlsx",
        meta: {},
        lists: [
          {
            title: "List 1",
            headers: [
              {
                text: "1 column name",
                width: 50
              },
              {
                text: "2 column name",
                width: 50
              }
            ],
            data: ["Другие", [1, "352094082090793"], [2, "352094082090793"]]
          }
        ]
      };
      const generatedxlsx = await excelGenerator.generateXlsx(data);
      generatedxlsx.should.have.deep.property("success", true);
    });
  });

  it("Report Signin user", async () => {
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

    await db.organization.create(organizationData);
    db.user.destroy({
      truncate: true,
      cascade: true
    });
    const salt = createSalt();
    const pass = hashPassword("Passw0rd!#", salt);
    let userData = {
      id: "f713eac0-4261-11ea-9301-05aa7d09559e",
      name: "ab198",
      email: "ab198@enovate-it.com",
      pass,
      organization_id,
      role_id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
      realm: ENV.realmId,
      wialon_token: "aaaaae5242d5738fb1f28cb85da261b8b181e80080b9",
      email_verified_at: null,
      is_active: false,
      ctime: "2020-01-29T06:38:31Z",
      mtime: "2020-02-07T05:19:18Z",
      salt
    };

    let user = await db.user.create(userData);
    userId = user.id;

    await db.route.destroy({
      truncate: true,
      cascade: true
    });

    await db.route.create({
      id: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
      method: "buildReport",
      service: "report-service",
      description: "",
      type: 2,
      organization_id,
      requirements: null,
      removed: 0,
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z",
      maker: userId
    });

    let wialonAccountDataKazan = {
      id: 1,
      wialon_username: "kazan",
      wialon_token: config.wialon_token,
      wialon_hosting_url: "https://hst-api.wialon.com",
      organization_id,
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    };
    let wialonAccountDataVesta = {
      id: 2,
      wialon_username: "vesta",
      wialon_token: config.wialon_token,
      wialon_hosting_url: "http://gps01.st-gps.ru:8025",
      organization_id,
      ctime: "2020-01-20T13:54:05Z",
      mtime: "2020-01-20T13:54:05Z"
    };
    let wialonAccountDataGeneric = {
      id: 3,
      wialon_username: "generic",
      wialon_token: config.wialon_token,
      wialon_hosting_url: "https://hst-api.wialon.com",
      organization_id,
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

    routeId = "00c07ba3-580a-4a5b-b699-b53f737a3bca";
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signin"
      },
      data: {
        login: "ab198@enovate-it.com",
        pass: "Passw0rd!#",
        is_test: true
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("token");
    userToken = res.body.data.token;
    global.userToken = userToken;
  });

  function wait(seconds) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, seconds * 1000);
    });
  }

  describe("Report Service methods", () => {
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
      let data = {
        header: {
          id: 111,
          token: global.userToken,
          version: "0.0.0",
          service: "report-service",
          method: "buildCustom"
        },
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          name: "generic-docker",
          description: "custom report description",
          codeInBase64: true,
          code: genericCode
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      // res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("id");
      customReportId = res.body.data.id;
    });

    it("Update Custom Report", async () => {
      let data = {
        header: {
          id: 111,
          token: global.userToken,
          version: "0.0.0",
          service: "report-service",
          method: "updateCustom"
        },
        data: {
          routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
          id: customReportId,
          name: "generic-docker",
          description: "custom report description",
          codeInBase64: true,
          code: genericCode
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      res.body.data.should.have.deep.property("success", true);
    });

    it("Get all available reports", async () => {
      let data = {
        header: {
          id: 111,
          token: global.userToken,
          version: "0.0.0",
          service: "report-service",
          method: "getAllReports"
        },
        data: {
          start: 0,
          limit: 4
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      res.body.data[0].should.have.deep.property("key");
      res.body.data[0].should.have.deep.property("name");
      res.body.data[0].should.have.deep.property("text");
    });

    it("Get all reports in the process", async () => {
      let data = {
        header: {
          id: 111,
          token: global.userToken,
          version: "0.0.0",
          service: "report-service",
          method: "getReportsInProcess"
        },
        data: {},
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      res.body.data.should.have.deep.property("success");
    });

    it("Make custom report", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "report-service",
          method: "buildReport"
        },
        data: {
          report: "custom", // report name in reports/index.js
          report_id: customReportId,
          wialonAccountId: wialonAccountIdGeneric, // account id in the database
          params: {
            routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca"
          }
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      await wait(10);
      res.body.data.should.have.deep.property("success");
    });

    it("Make custom report(via Jasper)", async () => {
      await db.route.update(
        {
          formats: JSON.stringify({ _arr: ["xlsx"] }, null, 0),
          jasper_report_code: "empty"
        },
        {
          where: {
            id: "00c07ba3-580a-4a5b-b699-b53f737a3bca"
          }
        }
      );

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "report-service",
          method: "buildReport"
        },
        data: {
          report: "custom", // report name in reports/index.js
          report_id: customReportId,
          wialonAccountId: wialonAccountIdGeneric, // account id in the database
          params: {
            routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca"
          }
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );
      await wait(10);
      res.body.data.should.have.deep.property("success");
    });

    it("Remove Custom Report", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "report-service",
          method: "removeCustom"
        },
        data: {
          route_id: "00c07ba3-580a-4a5b-b699-b53f737a3bca"
        },
        userId: userId
      };
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );

      res.body.data.should.have.deep.property("success", true);

      fs.rmSync(
        `${__dirname}
          /../../../../reports/${customReportId}`,
        { recursive: true, force: true }
      );
    });

    //   it("Kazan: Create Custom Report generator", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "buildCustom"
    //       },
    //       data: {
    //         routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //         name: "kazan-docker",
    //         description: "custom report description",
    //         code: kazanCode,
    //         codeInBase64: true
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );

    //     res.body.data.should.have.deep.property("id");
    //     customReportId = res.body.data.id;
    //   });

    //   it("Update Custom Report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "updateCustom"
    //       },
    //       data: {
    //         routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //         id: customReportId,
    //         name: "kazan-docker",
    //         description: "custom report description",
    //         codeInBase64: true,
    //         code: kazanCode
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );
    //     res.body.data.should.have.deep.property("success", true);
    //   });

    //   it("Make custom report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "buildReport"
    //       },
    //       data: {
    //         report: "custom", // report name in reports/index.js
    //         report_id: customReportId,
    //         wialonAccountId: wialonAccountIdGeneric, // account id in the database
    //         params: {
    //           routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //           startDate: "2020-02-03T06:30:00.000Z",
    //           endDate: "2020-02-06T06:30:00.000Z",
    //           unit: 18370479
    //         }
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );
    //     await wait(10);
    //     res.body.data.should.have.deep.property("success");
    //   });

    //   it("Remove Custom Report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "removeCustom"
    //       },
    //       data: {
    //         id: customReportId
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );

    //     res.body.data.should.have.deep.property("success", true);
    //   });

    //   it("Vesta: Create Custom Report generator", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: global.userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "buildCustom"
    //       },
    //       data: {
    //         routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //         name: "vesta-docker",
    //         description: "custom report description",
    //         code: vestaCode,
    //         codeInBase64: true
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );

    //     res.body.data.should.have.deep.property("id");
    //     customReportId = res.body.data.id;
    //   });

    //   it("Update Custom Report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "updateCustom"
    //       },
    //       data: {
    //         routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //         id: customReportId,
    //         name: "vesta-docker",
    //         description: "custom report description",
    //         codeInBase64: true,
    //         code: vestaCode
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );
    //     res.body.data.should.have.deep.property("success", true);
    //   });

    //   it("Make custom report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "buildReport"
    //       },
    //       data: {
    //         report: "custom", // report name in reports/index.js
    //         report_id: customReportId,
    //         wialonAccountId: wialonAccountIdVesta, // account id in the database
    //         params: {
    //           date: "2020-01-31",
    //           routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
    //           fromUnit: 0,
    //           toUnit: 2
    //         }
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );
    //     await wait(10);
    //     res.body.data.should.have.deep.property("success");
    //   });

    //   it("Remove Custom Report", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "removeCustom"
    //       },
    //       data: {
    //         id: customReportId
    //       },
    //       userId: userId
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );

    //     res.body.data.should.have.deep.property("success", true);
    //   });

    //   it("Get list of all units", async () => {
    //     let data = {
    //       header: {
    //         id: 111,
    //         token: userToken,
    //         version: "0.0.0",
    //         service: "report-service",
    //         method: "getAllUnits"
    //       },
    //       data: {
    //         wialonAccountId: wialonAccountIdGeneric
    //       }
    //     };
    //     const res = await doc(
    //       chai
    //         .request(server)
    //         .post("/")
    //         .set("content-type", "application/json")
    //         .set("authorization", "bearer" + realmToken)
    //         .send(data)
    //     );
    //     res.body.header.should.have.deep.property("status", "OK");
    //   });
  });
});
