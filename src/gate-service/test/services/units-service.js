import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";
import uuid from "uuid/v4";
import moment from "moment";
import { hashPassword, createSalt } from "@lib/utils";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let should = chai.should();
let userToken;
let organization_id;
let unitId = 25821361;
let wialonAccountIdGeneric = null;
global.ENV = null;
global.userToken = null;
global.realmToken = uuid();
global.sessionId = uuid();
global.realmId = null;

chai.use(chaiHttp);

describe("Units service methods", async () => {
  before(async () => {
    // ENV = await pretest.before();

    realmId = ENV.realmId;
    // await db.realm.update(
    //   {
    //     token: realmToken,
    //     permissions: {
    //       "auth-service": {
    //         signupAdmin: true,
    //         signupUser: true,
    //         signin: true
    //       },
    //       "units-service": {
    //         getUnitResourceData: true,
    //         getUnitDetailsData: true,
    //         getTripDetails: true,
    //         getFuelEntries: true,
    //         getFuelUsageDetails: true,
    //         getUtilizationCostDetails: true,
    //         getServiceEntries: true,
    //         getUpcomingMaintenance: true
    //       }
    //     }
    //   },
    //   {
    //     where: {
    //       id: ENV.realmId
    //     }
    //   }
    // );
  });

  after(async () => {
    await db.organization.destroy({ truncate: true, cascade: true });
    await db.user.destroy({ truncate: true, cascade: true });
    await db.wialon_accounts.destroy({ truncate: true, cascade: true });
  });

  it("Signin user", async () => {
    await db.organization.destroy({
      truncate: true,
      cascade: true
    });

    let organizationData = {
      organization_name: "Anita891",
      removed: 0
    };

    let organization = await db.organization.create(organizationData);
    organization_id = organization.id;
    const salt = createSalt();
    const pass = hashPassword("Passw0rd", salt);
    let userData = {
      name: "ab198",
      email: "ab198+1@enovate-it.com",
      pass,
      organization_id: organization_id,
      role_id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
      realm: ENV.realmId,
      wialon_token:
        "21c2af11b22a73564a4ab25e78eaea1308CD40CAB1DDDFA99B0C806CA7110885B0F48926",
      email_verified_at: null,
      is_active: true,
      salt
    };

    await db.user.create(userData);

    let wialonAccountDataGeneric = {
      wialon_username: "developers",
      wialon_token:
        "21c2af11b22a73564a4ab25e78eaea1308CD40CAB1DDDFA99B0C806CA7110885B0F48926",
      wialon_hosting_url: "https://hst-api.wialon.com",
      organization_id: organization_id
    };
    db.wialon_accounts.destroy({
      truncate: true,
      cascade: true
    });

    let wialonAccountGeneric = await db.wialon_accounts.create(
      wialonAccountDataGeneric
    );
    wialonAccountIdGeneric = wialonAccountGeneric.id;

    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signin"
      },
      data: {
        login: "ab198+1@enovate-it.com",
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
    userToken = res.body.data.token;
    global.userToken = userToken;
  });

  it("Get Unit Resource Data", async () => {
    let data = {
      header: {
        id: 111,
        token: userToken,
        version: "0.0.0",
        service: "units-service",
        method: "getUnitResourceData"
      },
      data: {
        wialonAccountId: wialonAccountIdGeneric,
        startsWith: 0,
        numOfRecords: 2
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
    res.body.data.should.have.deep.property("units");
  });

  it("Get Unit Details Data", async () => {
    if (unitId != null) {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getUnitDetailsData"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId
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
      res.body.data.should.have.deep.property("unitId");
    }
  });
  it("get Fuel Entries", async () => {
    if (unitId != null) {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getFuelEntries"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          dateRangeType: 1
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
      res.body.data.should.have.deep.property("fuelEntries");
    }
  });

  it("get Fuel Usage Details", async () => {
    if (unitId != null) {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getFuelUsageDetails"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          dateRangeType: 1
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
      res.body.data.should.have.deep.property("fuelUsages");
    }
  });

  it("get Service Entries", async () => {
    if (unitId != null) {
      let toDate = moment(new Date());
      let fromDate = moment(toDate).subtract(1, "days");
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getServiceEntries"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          fromDate: fromDate,
          toDate: toDate
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
      res.body.data.should.have.deep.property("serviceEntries");
    }
  });

  it("get Upcoming Maintenance", async () => {
    if (unitId != null) {
      let fromDate = moment(new Date()).add(1, "days");
      let toDate = moment(fromDate).add(1, "days");

      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getUpcomingMaintenance"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          fromDate: fromDate,
          toDate: toDate
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
      res.body.data.should.have.deep.property("upcomingServices");
    }
  });

  it("get Trip Details", async () => {
    if (unitId != null) {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getTripDetails"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          dateRangeType: 1
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
      res.body.data.should.have.deep.property("overAllScore");
    }
  });

  it("get Utilization Cost Details", async () => {
    if (unitId != null) {
      let data = {
        header: {
          id: 111,
          token: userToken,
          version: "0.0.0",
          service: "units-service",
          method: "getUtilizationCostDetails"
        },
        data: {
          wialonAccountId: wialonAccountIdGeneric,
          unitId: unitId,
          dateRangeType: 1
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
      res.body.data.should.have.deep.property("utilizationCosts");
    }
  });
});
