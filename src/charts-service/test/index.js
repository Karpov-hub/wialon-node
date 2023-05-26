import chai from "chai";
import db from "@lib/db";
import dotenv from "dotenv";
dotenv.config();
let should = chai.should();

const token =
  "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424";
const host = "http://localhost:8015";

import Service from "../src/Service.js";
const service = new Service({ name: "charts-service" });

import {
  _signInWithToken,
  _token_login,
  _getTemplates
} from "../src/lib/wialon";

describe("Charts service", async () => {
  before(async () => {
    // this code runs before all tests

    console.log("NODE_ENV: " + process.env.NODE_ENV);

    const token = process.env.WIALON_TOKEN;

    if (!token) {
      throw new Error(
        "No token defined! Create .env file in the root of the service and place the token variable into it."
      );
    }

    try {
      const user = await _signInWithToken("http://localhost:8015", token);
    } catch (e) {
      if (typeof e === "number") {
        throw new Error(
          `Server rejected our token with error code: ${e}. Try to generate another token and check again.`
        );
      }
    }

    await db.charts_users.destroy({
      truncate: true,
      cascade: true
    });
  });

  after(function() {});

  describe("User sign in", () => {
    // it("Return error if no host provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "sign_in",
    //       data: {}
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal("NO_HOST_PROVIDED");
    //   }
    // });

    // it("Return error if no token and hash provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "sign_in",
    //       data: {
    //         host: "http://localhost:8015"
    //       }
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal("NO_HASH_AND_TOKEN_PROVIDED");
    //   }
    // });

    // it("Return error if wrong token is provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "sign_in",
    //       data: {
    //         host: "http://localhost:8015",
    //         token:
    //           "21c2af11b22a73564a4ab25e78eaea1312F1718EF0BF98A08F0E0F1D09FB0B95C6DE94E1"
    //       }
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal(8);
    //   }
    // });

    // it("Return error if wrong hash is provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "sign_in",
    //       data: {
    //         host: "http://localhost:8015",
    //         hash: "21c2af11b22a73564a4ab25e78eaea1312F1718EF0BF98A"
    //       }
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal(1);
    //   }
    // });

    it("Successfully login as a new user with valid token and return the response object data", async () => {
      const res = await service.runServiceMethod({
        method: "sign_in",
        data: {
          host: "http://localhost:8015",
          token: process.env.WIALON_TOKEN
        }
      });
      res.should.be
        .an("object")
        .and.have.keys(
          "wUser",
          "user",
          "groups",
          "resources",
          "items",
          "token"
        );
    }).timeout(0);

    it("Successfully login as a new user with valid hash and return the response object data", async () => {
      const host = "http://localhost:8015";
      const user = await _token_login(host, process.env.WIALON_TOKEN);
      const sid = user.eid;

      await db.charts_users.destroy({
        truncate: true,
        cascade: true
      });

      const res = await service.runServiceMethod({
        method: "sign_in",
        data: {
          host,
          hash: sid
        }
      });
      res.should.be
        .an("object")
        .and.have.keys(
          "wUser",
          "user",
          "groups",
          "resources",
          "items",
          "token"
        );
    }).timeout(0);

    it("Successfully login as an existing user with valid token and return the response object data", async () => {
      const res = await service.runServiceMethod({
        method: "sign_in",
        data: {
          host: "http://localhost:8015",
          token: process.env.WIALON_TOKEN
        }
      });
      res.should.be
        .an("object")
        .and.have.keys(
          "wUser",
          "user",
          "groups",
          "resources",
          "items",
          "token"
        );
    }).timeout(0);

    it("Successfully login as an existing user with valid hash and return the response object data", async () => {
      const host = "http://localhost:8015";
      const user = await _token_login(host, process.env.WIALON_TOKEN);
      const sid = user.eid;

      const res = await service.runServiceMethod({
        method: "sign_in",
        data: {
          host,
          hash: sid
        }
      });
      res.should.be
        .an("object")
        .and.have.keys(
          "wUser",
          "user",
          "groups",
          "resources",
          "items",
          "token"
        );
    }).timeout(0);
  });

  describe("User set templates", () => {
    // it("Return error if no data provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "set_templates",
    //       data: {}
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal("MISSING_DATA");
    //   }
    // });

    it("Return success if correct data provided", async () => {
      const engineReportResource =
        process.env.WIALON_TEST_ENGINE_REPORT_RESOURCE;
      const engineReportTemplate =
        process.env.WIALON_TEST_ENGINE_REPORT_TEMPLATE;
      const ecoReportResource = process.env.WIALON_TEST_ECO_REPORT_RESOURCE;
      const ecoReportTemplate = process.env.WIALON_TEST_ECO_REPORT_TEMPLATE;

      if (
        !engineReportResource ||
        !engineReportTemplate ||
        !ecoReportResource ||
        !ecoReportTemplate
      )
        throw "Set the correct templates/resources in ENV";

      const data = {
        host,
        token,
        engineReportResource,
        engineReportTemplate,
        ecoReportResource,
        ecoReportTemplate
      };

      const res = await service.runServiceMethod({
        method: "set_templates",
        data
      });
      const response = res.toJSON();
      response.should.be.a("object");
    }).timeout(0);
  });

  // Charts data tests should run ONLY right after the set_templates tests
  describe("Charts data", () => {
    // it("Returns error if no data provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "charts_data",
    //       data: {}
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal("MISSING_DATA");
    //   }
    // });

    it("Returns data for charts if the correct data provided", async () => {
      const { wUser, groups } = await service.runServiceMethod({
        method: "sign_in",
        data: { host, token }
      });

      const res = await service.runServiceMethod({
        method: "charts_data",
        data: {
          host,
          token,
          group: groups[0].id,
          from: 1605416400,
          to: 1605589199
        }
      });

      res.should.have.property("chartsData");
      res.chartsData.should.have.property("length"); // Due to the 'from' & 'to' parameters it should contain 4 shifts + 1 average data item
    }).timeout(0);
  });

  describe("getMailingList", () => {
    // it("Returns error if no data provided", async () => {
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "get_mailing_list",
    //       data: {}
    //     });
    //     res.should.to.be.a("null");
    //   } catch (e) {
    //     e.should.be.equal("MISSING_DATA");
    //   }
    // });

    it("Returns the list if the correct data provided", async () => {
      const res = await service.runServiceMethod({
        method: "get_mailing_list",
        data: {
          host,
          token
        }
      });
      res.should.be.a("array");
    });
  });

  let mailing_id = null;

  describe("addMailing", () => {
    it("Returns the created mailing item", async () => {
      const email = "1@1.ty";
      const res = await service.runServiceMethod({
        method: "add_mailing",
        data: {
          host,
          token,
          email,
          hour: 8
        }
      });
      res
        .toJSON()
        .should.be.a("object")
        .and.have.keys("id", "user_id", "email", "hour", "mtime", "ctime");
      res.email.should.be.equal(email);
      mailing_id = res.id;
    });
  });

  describe("Update mailing", () => {
    it("Returns the updated mailing item", async () => {
      const email = "2@2.ty";
      const res = await service.runServiceMethod({
        method: "update_mailing",
        data: {
          host,
          token,
          email,
          hour: 11,
          id: mailing_id
        }
      });
      res
        .toJSON()
        .should.be.a("object")
        .and.have.keys("id", "user_id", "email", "hour", "mtime", "ctime");
      res.email.should.be.equal(email);
      res.hour.should.be.equal(11);
    });
  });

  describe("Delete mailing", () => {
    it("Returns the deleted mailing count", async () => {
      const res = await service.runServiceMethod({
        method: "remove_mailing",
        data: {
          host,
          token,
          id: mailing_id
        }
      });
      res.should.be.equal(1);
    });
  });

  describe("Switch mailing", () => {
    it("Returns the update result", async () => {
      const res = await service.runServiceMethod({
        method: "switch_mailings",
        data: {
          host,
          token,
          mailing: false
        }
      });
      res.should.be
        .a("array")
        .and.have.property("0")
        .equal(1);
    });
  });

  describe("Set default group for mailing", () => {
    it("Returns the update result", async () => {
      const res = await service.runServiceMethod({
        method: "set_mailing_group",
        data: {
          host,
          token,
          defaultGroup: 1
        }
      });
      res.should.be
        .a("array")
        .and.have.property("0")
        .equal(1);
    });
  });
});
