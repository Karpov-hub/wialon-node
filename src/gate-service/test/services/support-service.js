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

let ticketId = null;
let userId = null;
let realmId;

chai.use(chaiHttp);

describe("Supports service methods", () => {
  before(async () => {
    //ENV = await pretest.before();
    userId = ENV.user1.dataValues.id;
    realmId = ENV.realmId;
  });

  after(async () => {
    //await db.role.destroy({ truncate: true, cascade: true });
  });

  it("Create Ticket", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "createTicket",
        token: global.userToken
      },
      data: {
        title: "Ticket",
        category: 1,
        message: "Problem with Report",
        is_user_message: true
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );
    if (res && res.body && res.body.data && res.body.data.success == true) {
      ticketId = res.body.data.ticket.ticket_id;
    }

    res.body.data.should.have.deep.property("success", true);
  });
  it("Create Comment", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "createComment",
        token: global.userToken
      },
      data: {
        ticket_id: ticketId,
        message: "Hi",
        is_user_message: true
      }
    };
    const userComment = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    data.data.is_user_message = false;
    data.data.message = "Hi, from admin-panel";
    const adminComment = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    userComment.body.data.should.have.deep.property("success", true);
    adminComment.body.data.should.have.deep.property("success", true);
  });
  it("Get Tickets", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "getTickets",
        token: global.userToken
      },
      data: {
        start: 0,
        limit: 5
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );
    res.body.data.should.have.deep.property("success", true);
  });
  it("Get Сomments", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "getComments",
        token: global.userToken
      },
      data: {
        ticketId,
        start: 0,
        limit: 5
      }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("success", true);
  });

  it("Get count of new comments", async () => {
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "getCountOfNewComments",
        token: global.userToken
      },
      data: {}
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("count", 1);
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

    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "readNewComments",
        token: global.userToken
      },
      data: {
        ids: commentsIds
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("countUpdated", 1);
  });

  it("Resolve the ticket from the client side", async () => {
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "resolveTicket",
        token: global.userToken
      },
      data: {
        id: ticketId
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("id", ticketId);
  });

  it("Resolve the ticket from the client side (should return 'INVALIDSCHEMA')", async () => {
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "resolveTicket",
        token: global.userToken
      },
      data: {
        id: "123" //wrong UUID.v4 format
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "ERROR");
    res.body.error.should.have.deep.property("code", "INVALIDSCHEMA");
    res.body.error.should.have.deep.property("message");
  });

  it("Resolve the ticket from the client side (should return 'TICKETNOTFOUND')", async () => {
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "resolveTicket",
        token: global.userToken
      },
      data: {
        id: "ff7396da-8ac5-4a26-83c0-5db6d52dc899"
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "ERROR");
    res.body.error.should.have.deep.property("code", "TICKETNOTFOUND");
    res.body.error.should.have.deep.property("message");
  });
  it("Resolve the ticket from the client side (should return 'TICKETALREADYCLOSEDORRESOLVED')", async () => {
    const data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "support-service",
        method: "resolveTicket",
        token: global.userToken
      },
      data: {
        id: ticketId
      }
    };

    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + global.realmToken)
        .send(data)
    );

    res.body.header.should.have.deep.property("status", "ERROR");
    res.body.error.should.have.deep.property(
      "code",
      "TICKETALREADYCLOSEDORRESOLVED"
    );
    res.body.error.should.have.deep.property("message");
  });
});
