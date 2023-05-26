import chai from "chai";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";
import uuid from "uuid";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;
let should = chai.should();

let ENV = null;
let realmId = null;
let wialonAccount = null;
let aggregator = null;
let userToken = null;
let organizationAccountAggregator = null;
let cardId = null;
const realmToken = uuid.v4();

describe("Wialon units service", async () => {
  before(async () => {
    // this code runs before all tests
    ENV = await pretest.before();
    realmId = ENV.realmId;
    wialonAccount = ENV.wialonAccount;
    aggregator = ENV.aggregator;
    organizationAccountAggregator = ENV.aggregatorAccount;

    await db.realm.update(
      {
        token: realmToken,
        permissions: {
          "auth-service": {
            signin: true
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
        where: { id: realmId }
      }
    );
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "auth-service",
        method: "signin"
      },
      data: {
        login: "testuser@user.com",
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
    userToken = res.body.data.token;
  });
  after(function() {});

  describe("Get units, groups, attach and detach the card to the unit, upload and delete the transactions", () => {
    it("Get all units with their fuel cards", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "getUnits",
          token: userToken
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
      res.body.data.should.have.deep.property("items");
      expect(res.body.data.totalItemsCount).is.greaterThan(0);
      expect(typeof res.body.data.items).is.equal("object");
    });
    it("Get all groups", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "getGroups",
          token: userToken
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
      res.body.data.should.have.deep.property("items");
      expect(res.body.data.totalItemsCount).is.greaterThan(0);
      expect(typeof res.body.data.items).is.equal("object");
    });

    it("Attach the card to the unit", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "attachCardToUnit",
          token: userToken
        },
        data: {
          wialon_account_id: wialonAccount.id,
          card_number: "7826010108737772",
          organization_aggregator_account_id: organizationAccountAggregator.id,
          unit_id: 25965070
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
      res.body.data.should.have.property("success", true);

      cardId = res.body.data.card_id;
    });

    it("Upload the transactions from Aggregator to Wialon Unit", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "uploadTransactionsForOneUnit",
          token: userToken
        },
        data: {
          wialon_account_id: wialonAccount.id,
          unit_id: 25965070,
          start_date: 1677628800,
          end_date: 1678492800,
          card_id: cardId
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
      res.body.data.should.have.property("success", true);
    });

    it("Delete the transaction from Wialon Unit", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "deleteUnitTransactionsByCard",
          token: userToken
        },
        data: {
          start_date: 1677628800,
          end_date: 1678751999,
          unit_id: 25965067,
          card_number: "7826010104903774",
          wialon_account_id: wialonAccount.id
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
      res.body.data.should.have.property("success", true);
    });

    it("Update the card", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "updateCard",
          token: userToken
        },
        data: {
          card_number: "7826010104903774",
          organization_aggregator_account_id: organizationAccountAggregator.id,
          unit_id: 25965067,
          wialon_account_id: wialonAccount.id
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
      res.body.data.should.have.property("success", true);

      res.body.data.should.have.property("card");
      expect(typeof res.body.data.card).is.equal("object");

      res.body.data.card.should.have.property("id");
      expect(typeof res.body.data.card.id).is.equal("string");
      expect(res.body.data.card.id.length).is.equal(36);

      res.body.data.card.should.have.property(
        "organization_aggregator_account_id"
      );
      expect(
        typeof res.body.data.card.organization_aggregator_account_id
      ).is.equal("string");
      expect(
        res.body.data.card.organization_aggregator_account_id.length
      ).is.equal(36);
    });

    it("Detach the card from unit", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "detachCardFromUnit",
          token: userToken
        },
        data: {
          wialon_account_id: wialonAccount.id,
          id_field: 3,
          unit_id: 25965070,
          card_number: "7826010108737772",
          card_id: cardId
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
      res.body.data.should.have.property("success", true);

      res.body.data.should.have.property("deleted_card_id");
      expect(typeof res.body.data.deleted_card_id).is.equal("string");
      expect(res.body.data.deleted_card_id.length).is.equal(36);
    });
  });

  describe("Create report", () => {
    it("Create FUC report", async () => {
      const data = {
        header: {
          id: 111,
          version: "0.0.0",
          service: "wialon-units-service",
          method: "createReport",
          token: userToken
        },
        data: {
          start_date: 1677628800000,
          end_date: 1679097540000,
          start: 0,
          end: 0,
          descending: false,
          type_report: "GROUPS",
          unit_ids: [25965075],
          aggregator_ids: [aggregator.id],
          wialon_account_id: wialonAccount.id
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
      res.body.data.should.have.property("success", true);

      res.body.data.should.have.property("report");
      res.body.data.report.should.have.property("headers");

      res.body.data.report.should.have.property("data");
      expect(typeof res.body.data.report.data).to.equal("object");
      expect(res.body.data.report.data.length).greaterThan(0);

      res.body.data.report.should.have.property("total");
      expect(typeof res.body.data.report.total).to.equal("object");
      expect(res.body.data.report.total.length).greaterThan(0);

      res.body.data.report.should.have.property("file_name");
      expect(typeof res.body.data.report.file_name).to.equal("string");
      expect(res.body.data.report.file_name.length).to.equal(36);
    });
  });
});
