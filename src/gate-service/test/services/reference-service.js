import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import doc from "@lib/chai-documentator";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let should = chai.should();

let userId = null;
let realmId;
let routeId;

chai.use(chaiHttp);

describe("Reference service methods", () => {
  before(async () => {
    userId = ENV.user1.dataValues.id;
    realmId = ENV.realmId;
    routeId = ENV.route1.dataValues.id;
  });

  it("Get all References", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "reference-service",
        method: "getReferences",
        token: global.userToken,
        lang: "EN"
      },
      data: {
        lang: "en",
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

  it("Get Reference", async () => {
    let data = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "reference-service",
        method: "getReference",
        token: global.userToken,
        lang: "EN"
      },
      data: {
        route_id: routeId
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
});
