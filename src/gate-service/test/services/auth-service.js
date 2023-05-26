import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import memstore from "@lib/memstore";
import doc from "@lib/chai-documentator";
import uuid from "uuid/v4";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let should = chai.should();
let userToken, invitedUserToken;
let hash;
let invitedUserId;
let user_email = "usertest@test.ru";
let admin_email = "test@test.ru";
let organization_id;
let file = {};

global.ENV = null;
global.userToken = null;
global.realmToken = uuid();
global.sessionId = uuid();
global.realmId = null;

chai.use(chaiHttp);

describe("Auth service methods", () => {
  before(async () => {
    ENV = await pretest.before();
    realmId = ENV.realmId;
    await db.realm.update(
      {
        token: realmToken,
        permissions: {
          "auth-service": {
            getInvoices: true,
            getInvoiceDetails: true,
            downloadInvoice: true,
            downloadUsageReport: true,
            getUsageReport: true,
            listGenertatedReports: true,
            downloadReport: true,
            listUserWialonAccounts: true,
            getReportRoutes: true,
            customizedRequestReport: true,
            getOrganizationDetails: true,
            toggleUserStatus: true,
            updateOrganizationDetails: true,
            getOrganizationUsers: true,
            userVerification: true,
            changePermission: true,
            getPermissionInfo: true,
            signupAdmin: true,
            signupUser: true,
            signin: true,
            getCaptcha: true,
            checkOtp: true,
            getProfileDetails: true,
            pushFile: true,
            pullFile: true,
            delFile: true,
            acceptFile: true,
            statusFile: true,
            changePassword: true,
            passwordReminder: true,
            confirmEmail: true,
            inviteUser: true,
            updateProfile: true,
            verifyCode: true,
            addWialonAccount: true,
            removeWialonAccount: true,
            listWialonAccounts: true,
            setAccountsAccess: true,
            getAccessibleWialonAccounts: true,
            updateWialonAccount: true,
            signout: true,
            getCustomReportAccess: true,
            setCustomReportAccess: true,
            hideRecordOfGeneratedReport: true,
            listWialonAccountsForUser: true,
            resendVerifyCode: true,
            listWialonAccountsToGenerateReport: true,
            getRoutesByTypeAndOrganization: true,
            updatePreferredLang: true,
            requestToGetSandboxAccess: true
          },
          "units-service": {
            getUnitResourceData: true,
            getUnitDetailsData: true,
            getTripDetails: true,
            getFuelEntries: true,
            getFuelUsageDetails: true,
            getUtilizationCostDetails: true,
            getServiceEntries: true,
            getUpcomingMaintenance: true
          },
          "report-service": {
            getReportGeneric1: true,
            updateCustom: true,
            getVestaReport: true,
            getAllUnits: true,
            buildCustom: true,
            getReport: true,
            buildReport: true,
            getAllReports: true,
            getReportsInProcess: true,
            removeCustom: true,
            generateReport: true
          },
          "support-service": {
            createTicket: true,
            createComment: true,
            getTickets: true,
            getComments: true,
            getCountOfNewComments: true,
            readNewComments: true,
            resolveTicket: true
          },
          "reference-service": {
            getReferences: true,
            getReference: true
          },
          "wialon-units-service": {
            getUnits: true,
            attachCardToUnit: true,
            detachCardFromUnit: true,
            getGroups: true,
            uploadTransactionsForOneUnit: true,
            deleteUnitTransactionsByCard: true,
            createReport: true,
            updateCard: true
          }
        }
      },
      {
        where: { id: ENV.realmId }
      }
    );
  });

  after(async () => {
    await db.role.destroy({ truncate: true, cascade: true });
    await db.route.destroy({ truncate: true, cascade: true });
    // await db.user.destroy({ truncate: true, cascade: true });
    await db.provider.destroy({ truncate: true, cascade: true });
    await db.organization.destroy({ truncate: true, cascade: true });
    await db.Permissions.destroy({ truncate: true, cascade: true });
    // await db.letter.destroy({ truncate: true, cascade: true });
  });

  it("Valid realm token required", async () => {
    await db.tax_information.destroy({ truncate: true, cascade: true });
    await db.rates_package.destroy({ truncate: true, cascade: true });
    await db.package_subscription.destroy({ truncate: true, cascade: true });
    await db.invoice.destroy({ truncate: true, cascade: true });
    await db.user.destroy({ truncate: { cascade: true } });

    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signupAdmin"
      },
      data: {
        email: admin_email,
        name: "name",
        password: "Passw0rd!#",
        realm: ENV.realmId
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearerA" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "ERROR");
  });

  it("Get captcha", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "getCaptcha"
      },
      data: {
        token: sessionId,
        background: "#ffffff"
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
    res.body.data.should.have.deep.property("data");
  });

  it("Signup Admin", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signupAdmin"
      },
      data: {
        email: admin_email,
        name: "name",
        password: "Passw0rd!#",
        realm: ENV.realmId,
        token: sessionId,
        captcha: await memstore.get("cpt" + sessionId),
        wialon_token: "676e637ef0da11e981b42a2ae2dbcce4",
        wialon_hosting_url: "wialon hosting url",
        organization_name: "wialon hosting url"
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
  });

  it("Resend verify code", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "resendVerifyCode"
      },
      data: {
        email: admin_email,
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
  });

  it("Auth Signin user", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signin"
      },
      data: {
        login: admin_email,
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

  it("Sign out user", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signout",
        token: global.userToken
      },
      data: { token: global.userToken }
    };

    let storedUserTokenFull = await memstore.get("usr" + global.userToken);
    expect(storedUserTokenFull).to.be.a("string");
    let signOutRes = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    signOutRes.body.data.should.have.deep.property("success", true);
    let storedUserTokenEmpty = await memstore.get("usr" + global.userToken);
    expect(storedUserTokenEmpty).to.be.null;

    let userData = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signin"
      },
      data: {
        login: admin_email,
        pass: "Passw0rd!#",
        is_test: true
      }
    };

    let res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(userData)
    );
    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("token");
    userToken = res.body.data.token;
    global.userToken = userToken;
  });
  describe("Send invitation and signup user", () => {
    let data = {
      name: "name",
      password: "Passw0rd!#"
    };

    it("Send invitation", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "inviteUser",
          token: userToken
        },
        data: {
          email: user_email
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
      res.body.data.should.have.deep.property("encrypted_string");
      hash = res.body.data.encrypted_string;
    });

    it("Invite User Verification", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "userVerification",
          token: userToken
        },
        data: {
          hash: hash
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
      expect(res.body.data.data.email).to.equal(user_email);
      organization_id = res.body.data.data.organization_id;
    });

    it("Register new user", async () => {
      const token = uuid();
      let configDataToGetCaptcha = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "getCaptcha"
        },
        data: {
          token: token,
          background: "#ffffff"
        }
      };

      const captcha = await doc(
        chai
          .request(server)
          .post("/")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(configDataToGetCaptcha)
      );
      captcha.body.data.should.have.deep.property("data");

      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "signupUser",
          token: userToken
        },
        data: {
          organization_id: organization_id,
          email: user_email,
          name: "Invited User Name",
          password: "Passw0rd",
          token: token,
          captcha: await memstore.get("cpt" + token)
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
      invitedUserId = res.body.data.id;
    });

    it("Signin Invited user", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "signin"
        },
        data: {
          login: user_email,
          pass: "Passw0rd",
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
      invitedUserToken = res.body.data.token;
    });
  });

  describe("Profile Flow", () => {
    describe("Admin Profile Flow", () => {
      let new_name = "My New Admin Name";
      it("Update Profile", async () => {
        let data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "updateProfile"
          },
          data: {
            name: new_name,
            password: "Passw0rd!#",
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
        expect(res.body.data.name).to.equal(new_name);
      });

      it("Change the preferred language of the user", async () => {
        const data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "updatePreferredLang",
            lang: "RU"
          },
          data: {}
        };

        const res = await doc(
          chai
            .request(server)
            .post("/")
            .set("content-type", "application/json")
            .set("authorization", "bearer" + realmToken)
            .send(data)
        );

        const user = await db.user.findOne({
          raw: true,
          where: {
            email: admin_email,
            realm: ENV.realmId
          }
        });

        res.body.header.should.have.deep.property("status", "OK");
        res.body.data.should.have.deep.property("success", true);
        user.should.have.deep.property("preferred_language", "RU");
      });

      it("Get Profile", async () => {
        let data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "getProfileDetails"
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
        expect(res.body.data.name).to.equal(new_name);
      });
    });

    describe("User Profile Flow", () => {
      let new_name = "My New User Name";
      it("Update Profile", async () => {
        let data = {
          header: {
            id: 111,
            token: invitedUserToken,
            version: "0.0.0",
            service: "auth-service",
            method: "updateProfile"
          },
          data: {
            name: new_name,
            password: "Passw0rd!#",
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
        expect(res.body.data.name).to.equal(new_name);
      });

      it("Get Profile", async () => {
        let data = {
          header: {
            id: 111,
            token: invitedUserToken,
            version: "0.0.0",
            service: "auth-service",
            method: "getProfileDetails"
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
        expect(res.body.data.name).to.equal(new_name);
      });
    });
  });

  describe("Organisation Flow", () => {
    let organization_name = "New Organizatiod NAme";
    it("Update Organization Details", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "updateOrganizationDetails"
        },
        data: {
          organization_name: organization_name
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
      expect(res.body.data.organization.organization_name).to.equal(
        organization_name
      );
    });

    it("Get Organization Details", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getOrganizationDetails"
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
      expect(res.body.data.organization.organization_name).to.equal(
        organization_name
      );
    });

    it("Get Organization Users", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getOrganizationUsers"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("Change Organization User Status", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "toggleUserStatus"
        },
        data: {
          user_id: invitedUserId
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
    });
  });

  describe("Wialon Accounts Flow", () => {
    let wialon_acc_id;
    it("Add Wialon Account", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "addWialonAccount"
        },
        data: {
          wialon_username: "ab198",
          wialon_token: "811f7772ab93ced4d2e5c209c2c059e789c6bdd79dfee14e4efa4",
          wialon_hosting_url: "https://www.draw.io/",
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
      wialon_acc_id = res.body.data.res.id;
    });

    it("Remove Wialon Account", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "removeWialonAccount"
        },
        data: {
          wialon_acc_id: wialon_acc_id
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
    });

    it("List Wialon Accounts", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listWialonAccounts"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("List Wialon Accounts To Generate Report", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listWialonAccountsToGenerateReport"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("List Wialon Accounts For User", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listWialonAccountsForUser"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("List Wialon Accounts", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listWialonAccounts"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("Set Accounts Access", async () => {
      const wialon_accounts = await db.wialon_accounts.findOne({
        where: { organization_id: organization_id }
      });
      wialon_acc_id = wialon_accounts.id;

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "setAccountsAccess"
        },
        data: {
          userId: invitedUserId,
          accountsId: [wialon_acc_id]
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
    });

    it("Get Accessible wialon accounts of invited user", async () => {
      let data = {
        header: {
          id: 111,
          token: invitedUserToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getAccessibleWialonAccounts"
        },
        data: {
          start: 0,
          limit: 4
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
      expect(res.body.data.res[0].wialon_acc_id).to.equal(wialon_acc_id);
    });

    it("List Users Wialon Accounts", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listUserWialonAccounts"
        },
        data: {
          userId: invitedUserId,
          start: 0,
          limit: 4
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
    });
  });

  describe("Reports Flow", () => {
    it("Get Report Routes", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getReportRoutes"
        },
        data: {
          start: 1,
          limit: 5
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
    });

    let reportIdToDownload;

    it("List Genertaed Reports", async () => {
      let adminUser = await db.user.findOne({ where: { email: admin_email } });

      //Create Provider
      let provider = await db.provider.create({
        code: "d876dd30-5219-11ea-8196-b145ab2990b7",
        filename: "report.xlsx",
        file_size: 5442,
        mime_type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upload_date: "2020-02-18T06:42:34Z",
        storage_date: "2020-02-18T06:42:34Z",
        removed: 0
      });

      //Create Report Stats
      let reportStats = await db.report_stats.create({
        organization_id: organization_id,
        user_id: adminUser.dataValues.id,
        route_id: "580f07da-5a3a-4c3d-968b-ae2c5c96c87b",
        provider_id: "d876dd30-5219-11ea-8196-b145ab2990b7",
        report_generation_time: 3.129,
        report_size: 25564,
        report_params: "{}",
        status: 1
      });

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "listGenertatedReports"
        },
        data: {
          start: 0,
          limit: 15
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
      reportIdToDownload = reportStats.dataValues.id;
    });

    it("Download Reports", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "downloadReport"
        },
        data: {
          reportId: reportIdToDownload
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
    });

    it("Hide record of the generated reports", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "hideRecordOfGeneratedReport"
        },
        data: {
          id: reportIdToDownload
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
    }).timeout(0);

    it("Send customized Request Report", async () => {
      let text =
        "This is my new Customized report Below are points:\n" +
        "Point 1\nPoint 2\nPoint 3\nReport";

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "customizedRequestReport"
        },
        data: {
          text: text,
          isTest: true
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
    });
  });

  describe("Invoice Usage Report Flow", () => {
    let invoice, tax, packageRecord;
    it("Get Invoices", async () => {
      //Create rates_package
      packageRecord = await db.rates_package.create({
        package_name: "DefaultPackage",
        fixed_monthly_fees: 45.0,
        bytes_sent: 0.06,
        cpu_time_taken: 0.026,
        bytes_from_wialon: 0.13,
        no_of_employees: 2.0,
        no_of_wialon_acc: 1.0,
        is_offering_pkg: false,
        ctime: new Date(),
        mtime: new Date()
      });
      //Create package_subscription
      await db.package_subscription.create({
        organization_id: organization_id,
        rates_package_id: packageRecord.dataValues.id,
        from_date: "2018-03-24 12:27:35.765",
        ctime: new Date(),
        mtime: new Date()
      });
      //Create tax Information
      tax = await db.tax_information.create({
        percentage: 11.6,
        from_date: "2018-04-01 00:00:00",
        to_date: "2021-03-31 00:00:00",
        ctime: new Date(),
        mtime: new Date()
      });
      //Create invoice
      invoice = await db.invoice.create({
        adjustment: 0,
        total_fees: 36282.59,
        from_date: "2020-02-29T18:30:00Z",
        to_date: "2020-03-30T18:30:00Z",
        invoice_date: "2020-03-31T18:30:00Z",
        bytes_sent: 5441,
        cpu_time_taken: 7.955,
        bytes_from_wialon: 76710,
        no_of_employees: 7,
        no_of_wialon_acc: 4,
        tax_id: tax.dataValues.id,
        organization_id: organization_id,
        ctime: new Date(),
        mtime: new Date()
      });

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getInvoices"
        },
        data: {
          year: 2020,
          start: 0,
          limit: 5
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
    });

    it("Get Invoice Details", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getInvoiceDetails"
        },
        data: {
          start: 1,
          limit: 11,
          invoiceId: invoice.id
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
    });

    it("Download Invoice", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "downloadInvoice"
        },
        data: {
          invoiceId: invoice.id
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
    });

    it("Generate Usage Reports", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getUsageReport"
        },
        data: {
          start: 1,
          limit: 4,
          invoiceId: invoice.id
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
    });

    it("Download Usage Reports", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "downloadUsageReport"
        },
        data: {
          invoiceId: invoice.id
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
    });
  });

  describe("Permissions Flow", () => {
    it("Get Permission Info", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getPermissionInfo"
        },
        data: {
          start: 0,
          limit: 4
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
    });

    it("Get Permission By Type", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "getRoutesByTypeAndOrganization"
        },
        data: {
          start: 0,
          limit: 4,
          type: 1
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
    });

    it("Change permission of route for specific role", async () => {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "auth-service",
          method: "changePermission"
        },
        data: {
          role_id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
          route_id: "580f07da-5a3a-4c3d-968b-ae2c5c96c87b",
          is_permissible: false
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
    });
  });

  describe("File provider", async () => {
    before(async () => {
      await db.provider.truncate();
      await db.provider.create({
        id: "df34ada1-ffe2-4a2f-aad6-f1301c95b050",
        code: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18",
        filename: "bill.txt",
        file_size: 10,
        mime_type: "text/plain",
        upload_date: new Date(),
        storage_date: new Date().setSeconds(new Date().getSeconds() + 300),
        ctime: new Date(),
        mtime: new Date(),
        removed: 0
      });
    });
    after(async () => {
      await db.provider.truncate();
    });

    it("Push file", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "pushFile",
          token: userToken
        },
        data: {
          name: "electricity_bill.txt",
          data:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC",
          size: 8
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
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
      file.code = res.body.data.code;
      file.name = data.data.name;
      file.size = res.body.data.size;
      file.sendData = data.data.data;
    });
    it("Pull file", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "pullFile",
          token: userToken
        },
        data: {
          code: file.code
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
      res.body.data.should.have.deep.property("name").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("size").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("data").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("name").to.equal(file.name);
      res.body.data.should.have.deep.property("size").to.equal(file.size);
    });

    // it("Watermark file", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: "0.0.0",
    //       service: "auth-service",
    //       method: "watermarkFile",
    //       token: userToken
    //     },
    //     data: {
    //       code: file.code
    //     }
    //   };
    //   const res = await doc(
    //     chai
    //       .request(server)
    //       .post("/")
    //       .set("content-type", "application/json")
    //       .set("authorization", "bearer" + realmToken)
    //       .send(data)
    //   );
    //   res.body.header.should.have.deep.property("status", "OK");
    //   res.body.data.should.have.deep.property("success", true);
    //   res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
    //   res.body.data.should.have.deep.property("code").to.equal(file.code);
    // });

    // it("Accept file", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: "0.0.0",
    //       service: "auth-service",
    //       method: "acceptFile",
    //       token: userToken
    //     },
    //     data: [
    //       {
    //         name: "bill.txt",
    //         data: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18"
    //       },
    //       {
    //         name: "electricity_bill.txt",
    //         data: file.code
    //       }
    //     ]
    //   };
    //   const res = await doc(
    //     chai
    //       .request(server)
    //       .post("/")
    //       .set("content-type", "application/json")
    //       .set("authorization", "bearer" + realmToken)
    //       .send(data)
    //   );
    //   res.body.header.should.have.deep.property("status", "OK");
    //   res.body.data.should.have.deep.property("success", true);
    // });

    it("Status file", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "statusFile",
          token: userToken
        },
        data: {
          code: file.code
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
      res.body.data.should.have.deep.property("name").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("size").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("name").to.equal(file.name);
      res.body.data.should.have.deep.property("size").to.equal(file.size);
    });
    it("Delete file", async () => {
      let data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "auth-service",
          method: "delFile",
          token: userToken
        },
        data: {
          code: file.code
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
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
      res.body.data.should.have.deep.property("code").to.equal(file.code);
    });
  });

  describe("Custom Report Access Flow", () => {
    describe("Get Custom Report Access by User", () => {
      it("Get Custom Report Access", async () => {
        let data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "getCustomReportAccess"
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
      });
      it("Set Custom Report Access ", async () => {
        let data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "setCustomReportAccess"
          },
          data: {
            customReportAccess: 1
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
        expect(res.body.data.customReportAccess).to.equal(
          data.customReportAccess
        );
      });
      it("Request to get Sandbox Access ", async () => {
        let data = {
          header: {
            id: 111,
            token: userToken,
            version: "0.0.0",
            service: "auth-service",
            method: "requestToGetSandboxAccess"
          },
          data: {}
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
        res.body.data.should.have.deep.property("success", true);
        res.body.data.should.have.deep.property("currentStatus", 2);
      });
    });
  });
});
