import chai from "chai";
import { log, capture } from "../src/index";
capture();

let should = chai.should();

describe("log library tests", async () => {
  before(async () => {
    // this code runs before all tests
  });

  after(function() {});

  describe("Ping", () => {
    it("Should return test-pong", async () => {
      console.log("Default");
      console.warn("warn");
      console.error("error");
      log("http", null, { level: "http" });
    });
  });
});
