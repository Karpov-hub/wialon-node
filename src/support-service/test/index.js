import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
const should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({
  name: "support-service"
});

let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
let ENV;
let userId;
let ticketId;

describe("Support service", async () => {
  before(async () => {
    await db.comment.truncate();
    await db.ticket.truncate();
    ENV = await pretest.before();
    userId = ENV.user1.dataValues.id;
  });

  describe("Create ticket and comment", () => {
    it("Create ticket", async () => {
      const res = await service.runServiceMethod({
        method: "createTicket",
        data: {
          title: "Ticket",
          category: "Reports",
          message: "Problem with Report",
          is_user_message: true
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      ticketId = res.ticket.ticket_id;
    }).timeout(4000);

    it("Get tickets", async () => {
      const res = await service.runServiceMethod({
        method: "getTickets",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Create comment", async () => {
      const res = await service.runServiceMethod({
        method: "createComment",
        data: {
          ticket_id: ticketId,
          message: "Hi",
          is_user_message: true
        },
        realmId: ENV.realmId,
        userId
      });

      const adminMessage = await service.runServiceMethod({
        method: "createComment",
        data: {
          ticket_id: ticketId,
          message: "Hi from admin-panel",
          is_user_message: false
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
      adminMessage.should.have.deep.property("success", true);
    }).timeout(4000);

    it("Get comments", async () => {
      const res = await service.runServiceMethod({
        method: "getComments",
        data: {
          ticketId: ticketId
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Reopen ticket", async () => {
      const res = await service.runServiceMethod({
        method: "reopenTicket",
        data: {
          ticket_id: ticketId
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get count of new comments", async () => {
      const res = await service.runServiceMethod({
        method: "getCountOfNewComments",
        data: {},
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count", 1);
    });

    it("Read the new comments from administrator", async () => {
      const newComments = await db.comment.findAll({
        where: {
          is_new: true,
          is_user_message: false,
          ticket_id: ticketId
        },
        raw: true
      });

      const commentsIds = newComments.map((el) => el.id);

      const res = await service.runServiceMethod({
        method: "readNewComments",
        data: {
          ids: commentsIds
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("countUpdated", 1);
    });

    it("Resolve the ticket from the client side", async () => {
      const res = await service.runServiceMethod({
        method: "resolveTicket",
        data: {
          id: ticketId
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id", ticketId);
      res.should.have.deep.property("status", 1);
    });

    it("Close automatically a tickets, those have no comments more than 1 week", async () => {
      const res = await service.runServiceMethod({
        method: "closeInactiveTickets",
        data: {}
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count");
    });
  });
});
