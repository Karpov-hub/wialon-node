import chai from "chai";
import pretest from "@lib/pretest";
const expect = chai.expect;
let should = chai.should();
let ENV = null;
let realmId = null;
let userId = null;
let wialonAccount = null;
let aggregator = null;
let organizationAccountAggregator = null;
let cardId = null;

import Service from "../src/Service.js";
const service = new Service({ name: "wialon-units-service" });

describe("Wialon units service", async () => {
  before(async () => {
    // this code runs before all tests
    ENV = await pretest.before();
    realmId = ENV.realmId;
    userId = ENV.user1.id;
    wialonAccount = ENV.wialonAccount;
    aggregator = ENV.aggregator;
    organizationAccountAggregator = ENV.aggregatorAccount;
  });

  after(function() {});

  describe("Get units, groups, attach and detach the card to the unit, upload and delete the transactions", () => {
    it("Get all units with their fuel cards", async () => {
      const res = await service.runServiceMethod({
        method: "getUnits",
        data: {},
        userId,
        realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("items");
      expect(res.totalItemsCount).is.greaterThan(0);
      expect(typeof res.items).is.equal("object");
    });
    it("Get all groups", async () => {
      const res = await service.runServiceMethod({
        method: "getGroups",
        data: {},
        userId,
        realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("items");
      expect(res.totalItemsCount).is.greaterThan(0);
      expect(typeof res.items).is.equal("object");
    });
    it("Attach the card to the unit", async () => {
      const res = await service.runServiceMethod({
        method: "attachCardToUnit",
        data: {
          wialon_account_id: wialonAccount.id,
          card_number: "7826010108737772",
          organization_aggregator_account_id: organizationAccountAggregator.id,
          unit_id: 25965070
        },
        userId,
        realmId
      });

      res.should.have.property("success", true);

      res.should.have.property("card_id");
      expect(typeof res.card_id).is.equal("string");
      expect(res.card_id.length).is.equal(36);

      cardId = res.card_id;
    });

    it("Upload the transactions from Aggregator to Wialon Unit", async () => {
      const res = await service.runServiceMethod({
        method: "uploadTransactionsForOneUnit",
        data: {
          wialon_account_id: wialonAccount.id,
          card_id: cardId,
          start_date: 1677628800,
          end_date: 1678492800
        },
        userId,
        realmId
      });

      res.should.have.property("success", true);
    });

    it("Delete the transaction from Wialon Unit", async () => {
      const res = await service.runServiceMethod({
        method: "deleteUnitTransactionsByCard",
        data: {
          start_date: 1677628800,
          end_date: 1678751999,
          unit_id: 25965067,
          card_number: "7826010104903774",
          wialon_account_id: wialonAccount.id
        },
        userId,
        realmId
      });
      res.should.have.property("success", true);
    });

    it("Automation uploading the transactions every day", async () => {
      const res = await service.runServiceMethod({
        method: "uploadTransactions",
        data: {}
      });

      res.should.have.property("success", true);

      res.should.have.property("transaction_counter", 23);
    });

    it("Update card", async () => {
      const res = await service.runServiceMethod({
        method: "updateCard",
        data: {
          card_number: "7826010104903774",
          organization_aggregator_account_id: organizationAccountAggregator.id,
          unit_id: 25965067,
          wialon_account_id: wialonAccount.id
        },
        userId,
        realmId
      });

      res.should.have.property("success", true);
      res.should.have.property("card");
    });

    it("Try to update not existing card_id (should to return 'CARDNOTFOUND')", async () => {
      try {
        await service.runServiceMethod({
          method: "updateCard",
          data: {
            card_number: "7826010104903774",
            organization_aggregator_account_id:
              organizationAccountAggregator.id,
            unit_id: 25965067,
            wialon_account_id: wialonAccount.id,
            id: "c8da1571-a701-40ff-a26a-0129ed750350" // dummy id
          },
          userId,
          realmId
        });
      } catch (e) {
        e.should.be.equal("CARDNOTFOUND");
      }
    });

    it("Try to create a new cart, but with the same aggregator and card number (should to return 'CARDTOCREATEALREADYEXIST')", async () => {
      try {
        await service.runServiceMethod({
          method: "updateCard",
          data: {
            card_number: "7826010104903774",
            organization_aggregator_account_id:
              organizationAccountAggregator.id,
            unit_id: 25965067,
            wialon_account_id: wialonAccount.id
          },
          userId,
          realmId
        });
      } catch (e) {
        e.should.be.equal("CARDTOCREATEALREADYEXIST");
      }
    });

    it("Detach the card from unit", async () => {
      const res = await service.runServiceMethod({
        method: "detachCardFromUnit",
        data: {
          wialon_account_id: wialonAccount.id,
          id_field: 3,
          unit_id: 25965070,
          card_number: "7826010108737772",
          card_id: cardId
        },
        userId,
        realmId
      });
      res.should.have.property("success", true);

      res.should.have.property("deleted_card_id");
      expect(typeof res.deleted_card_id).is.equal("string");
      expect(res.deleted_card_id.length).is.equal(36);
    });
  });

  describe("Create report", () => {
    it("Create FUC report", async () => {
      const res = await service.runServiceMethod({
        method: "createReport",
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
        },
        userId,
        realmId
      });

      res.should.have.property("success", true);

      res.should.have.property("report");
      res.report.should.have.property("headers");

      res.report.should.have.property("data");
      expect(typeof res.report.data).to.equal("object");
      expect(res.report.data.length).greaterThan(0);

      res.report.should.have.property("total");
      expect(typeof res.report.total).to.equal("object");
      expect(res.report.total.length).greaterThan(0);

      res.report.should.have.property("file_name");
      expect(typeof res.report.file_name).to.equal("string");
      expect(res.report.file_name.length).to.equal(36);
    });
  });
});
