import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import doc from "@lib/chai-documentator";

let should = chai.should();

let authToken, userToken;

authToken = "123";

chai.use(chaiHttp);

describe("Gate Service", async () => {
  let PingData = {
    header: {
      id: 111,
      version: "0.1.0",
      service: "auth-service",
      method: "signup"
    },
    data: null
  };

  it("Ping, wrong version", async () => {
    PingData.header.version = "1";
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + authToken)
        .send(PingData)
    );
    res.body.header.status.should.equal("ERROR");
    res.body.error.code.should.equal("VERSION");
  });

  it("Ping skeleton microservice", async () => {
    let PingData = {
      header: {
        id: 111,
        version: "0.0.0",
        service: "skeleton",
        method: "ping"
      },
      data: null
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + authToken)
        .send(PingData)
    );
    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("test-pong", true);
  });
});
