import chai from "chai";
import db from "@lib/db";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import doc from "@lib/chai-documentator";
import dotenv from "dotenv";
import CONFIG from "@lib/config";
import wialonController from "../../../charts-service/src/lib/wialon";
dotenv.config({ path: "../charts-service/.env" });

let should = chai.should();
chai.use(chaiHttp);

const host = CONFIG.CHARTS_HOST;
const token =
  "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424";

describe("Charts Service", async () => {
  before(async () => {
    const token =
      "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424";
    /*
    if (!token) {
      throw new Error(
        "No token defined! Create .env file in the root of the service and place the token variable into it."
      );
    }
    */
    const user = await wialonController
      ._signInWithToken(CONFIG.CHARTS_HOST, token)
      .catch((e) => {
        console.log(
          "charts-service, describe(Charts Service), error on _signInWithToken, error: ",
          e
        );
        throw "CHARTSWIALONSIGNINERROR";
      });

    await db.charts_users.destroy({ truncate: true, cascade: true });
  });

  describe("Sign in Service", async () => {
    /*
    it("Return error if no host provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {}
      };

      const res = await doc(
        chai
          .request(server)s
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
      res.body.should.have.nested.property("error.code", "NO_HOST_PROVIDED");
    });

    it("Return error if no token and hash provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
      res.body.should.have.nested.property(
        "error.code",
        "NO_HASH_AND_TOKEN_PROVIDED"
      );
    });

    it("Return error if wrong token is provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          token:
            "21c2af11b22a73564a4ab25e78eaea1312F1718EF0BF98A08F0E0F1D09FB0B95C6DE94E1"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
      res.body.should.have.nested.property("error.code", 8);
    });

    it("Return error if wrong hash is provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          hash: "21c2af11b22a73564a4ab25e78eaea1312F1718EF0BF98A"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
      res.body.should.have.nested.property("error.code", 1);
    });
    */

    it("Successfully login as a new user with valid token and return the response object data", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          token:
            "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.should.not.have.property("error");
      res.body.should.have.property("data");
      res.body.data.should.have.keys(
        "wUser",
        "user",
        "groups",
        "resources",
        "items",
        "token"
      );
    });

    it("Successfully login as a new user with valid hash and return the response object data", async () => {
      const user = await wialonController._token_login(
        host,
        "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424"
      );
      const sid = user.eid;

      await db.charts_users.destroy({ truncate: true, cascade: true });

      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          hash: sid
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.should.not.have.property("error");
      res.body.should.have.property("data");
      res.body.data.should.have.keys(
        "wUser",
        "user",
        "groups",
        "resources",
        "items",
        "token"
      );
    });

    it("Successfully login as an existing user with valid token and return the response object data", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          token:
            "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.should.not.have.property("error");
      res.body.should.have.property("data");
      res.body.data.should.have.keys(
        "wUser",
        "user",
        "groups",
        "resources",
        "items",
        "token"
      );
    });

    it("Successfully login as an existing user with valid hash and return the user, groups, templates, token", async () => {
      const user = await wialonController._token_login(
        host,
        "21c2af11b22a73564a4ab25e78eaea13FC16A3AB6CAD6EB87B4B2F547824A8897D3EC424"
      );
      const sid = user.eid;

      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "sign_in"
        },
        data: {
          host,
          hash: sid
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.should.not.have.property("error");
      res.body.should.have.property("data");
      res.body.data.should.have.keys(
        "wUser",
        "user",
        "groups",
        "resources",
        "items",
        "token"
      );
    });
  });

  describe("Set templates Service", () => {
    /*
    it("Return error if no data provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "set_templates"
        },
        data: {}
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
    });
    */
    it("Returns success if correct data provided", async () => {
      const engineReportResource =
        process.env.WIALON_TEST_ENGINE_REPORT_RESOURCE;
      const engineReportTemplate =
        process.env.WIALON_TEST_ENGINE_REPORT_TEMPLATE;
      const ecoReportResource = process.env.WIALON_TEST_ECO_REPORT_RESOURCE;
      const ecoReportTemplate = process.env.WIALON_TEST_ECO_REPORT_TEMPLATE;

      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "set_templates"
        },
        data: {
          host,
          token,
          engineReportResource,
          engineReportTemplate,
          ecoReportResource,
          ecoReportTemplate
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );

      const response = res.toJSON();
      response.should.be.a("object");
    });
  });

  describe("Charts data", () => {
    /*
    it("Return error if no data provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "charts_data"
        },
        data: {}
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
    });
    */

    it("Returns data for charts if the correct data provided", async () => {
      const sign = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send({
            header: {
              id: 111,
              version: "0.0.0",
              service: "charts-service",
              method: "sign_in"
            },
            data: { host, token }
          })
      );

      const groups = sign.body.data.groups;

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send({
            header: {
              id: 111,
              version: "0.0.0",
              service: "charts-service",
              method: "charts_data"
            },
            data: {
              host,
              token,
              group: groups[0].id,
              from: 16054164,
              to: 16055891
            }
          })
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.should.not.have.property("error");
    });
  });

  describe("Mailing list CRUD", () => {
    describe("getMailingList", () => {
      /*
      it("Return error if no data provided", async () => {
        let data = {
          header: {
            id: 111,
            version: "0.0.0",
            service: "charts-service",
            method: "get_mailing_list"
          },
          data: {}
        };

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send(data)
        );
        res.body.header.should.have.deep.property("status", "ERROR");
        res.body.should.have.property("error");
      });
      */
      it("Returns the list if the correct data provided", async () => {
        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send({
              header: {
                id: 111,
                version: "0.0.0",
                service: "charts-service",
                method: "get_mailing_list"
              },
              data: {
                host,
                token
              }
            })
        );

        res.body.data.should.be.a("array");
      });
    });

    let mailing_id = null;
    describe("Add mailing", () => {
      /*
      it("Return error if no data provided", async () => {
        let data = {
          header: {
            id: 111,
            version: "0.0.0",
            service: "charts-service",
            method: "add_mailing"
          },
          data: {}
        };

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send(data)
        );
        res.body.header.should.have.deep.property("status", "ERROR");
        res.body.should.have.property("error");
      });
      */

      it("Returns the created item if the correct data provided", async () => {
        const email = "1@1.ty";

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send({
              header: {
                id: 111,
                version: "0.0.0",
                service: "charts-service",
                method: "add_mailing"
              },
              data: {
                host,
                token,
                email,
                hour: 8
              }
            })
        );

        res.body.data.should.be
          .a("object")
          .and.have.keys("id", "user_id", "email", "hour", "mtime", "ctime");
        res.body.data.email.should.be.equal(email);
        mailing_id = res.body.data.id;
      });
    });

    describe("Update mailing", () => {
      /*
      it("Return error if no data provided", async () => {
        let data = {
          header: {
            id: 111,
            version: "0.0.0",
            service: "charts-service",
            method: "update_mailing"
          },
          data: {}
        };

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send(data)
        );
        res.body.header.should.have.deep.property("status", "ERROR");
        res.body.should.have.property("error");
      });
      */

      it("Returns the updated item if the correct data provided", async () => {
        const email = "2@2.ty";

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send({
              header: {
                id: 111,
                version: "0.0.0",
                service: "charts-service",
                method: "update_mailing"
              },
              data: {
                host,
                token,
                email,
                id: mailing_id,
                hour: 11
              }
            })
        );

        res.body.data.should.be
          .a("object")
          .and.have.keys("id", "user_id", "email", "hour", "mtime", "ctime");
        res.body.data.email.should.be.equal(email);
        res.body.data.hour.should.be.equal(11);
      });
    });

    describe("Delete mailing", () => {
      /*
      it("Return error if no data provided", async () => {
        let data = {
          header: {
            id: 111,
            version: "0.0.0",
            service: "charts-service",
            method: "remove_mailing"
          },
          data: {}
        };

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send(data)
        );
        res.body.header.should.have.deep.property("status", "ERROR");
        res.body.should.have.property("error");
      });
      */

      it("Returns the deleted item count", async () => {
        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .send({
              header: {
                id: 111,
                version: "0.0.0",
                service: "charts-service",
                method: "remove_mailing"
              },
              data: {
                host,
                token,
                id: mailing_id
              }
            })
        );

        res.body.data.should.be.equal(1);
      });
    });
  });

  describe("Mailing switch", () => {
    /*
    it("Return error if no data provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "switch_mailings"
        },
        data: {}
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
    });
    */

    it("Returns the updated item count", async () => {
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send({
            header: {
              id: 111,
              version: "0.0.0",
              service: "charts-service",
              method: "switch_mailings"
            },
            data: {
              host,
              token,
              mailing: false
            }
          })
      );

      res.body.data.should.be
        .a("array")
        .and.have.property("0")
        .equal(1);
    });
  });

  describe("Set mailing group", () => {
    /*
    it("Return error if no data provided", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "charts-service",
          method: "set_mailing_group"
        },
        data: {}
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.should.have.property("error");
    });
    */

    it("Returns the updated item count", async () => {
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .send({
            header: {
              id: 111,
              version: "0.0.0",
              service: "charts-service",
              method: "set_mailing_group"
            },
            data: {
              host,
              token,
              defaultGroup: 1
            }
          })
      );

      res.body.data.should.be
        .a("array")
        .and.have.property("0")
        .equal(1);
    });
  });
});
