import chai from "chai";
let should = chai.should();

import Service from "../src/Service.js";
const service = new Service({ name: "skeleton" });

describe("Skeleton service", async () => {
  before(async () => {
    // this code runs before all tests
  });

  after(function() {});

  describe("Ping", () => {
    it("Should return test-pong", async () => {
      const res = await service.runServiceMethod({
        method: "ping",
        data: {}
      });
      res.should.have.deep.property("test-pong", true);
    });
  });
});
