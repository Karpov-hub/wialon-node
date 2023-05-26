import chai from "chai";
let should = chai.should();
import memstore from "@lib/memstore";
import sha256 from "sha256";

import Service from "../src/Service.js";
const service = new Service({ name: "skeleton" });

import lib from "../src/lib";
import pretest from "@lib/pretest";
let ENV;

describe("Notifications service", async () => {
  before(async () => {
    // this code runs before all tests
    ENV = await pretest.before();
  });

  after(function() {});

  it("Reintialize the notifications", async () => {
    const res = await service.runServiceMethod({
      method: "init"
    });
    res.success.should.equal(true);
  });

  it("Add new notification to queue", async () => {
    const data = {
      level: "error",
      message: "Notifications test error message",
      details: "Notification details"
    };
    const res = await service.runServiceMethod({
      method: "addToQueue",
      data
    });
    res.success.should.equal(true);

    const key = sha256(JSON.stringify(data.message));
    let notification = await memstore.get(`alarms:telegram:${key}`);
    should.exist(notification);
    notification = JSON.parse(notification);
    notification.message.should.equal(data.message);
    notification.level.should.equal(data.level);
    notification.details.should.equal(data.details);
    notification.provider.should.equal("telegram");
    should.exist(notification.timestamp);

    const block = await memstore.get(`alarms-blocks:telegram:${key}`);
    block.should.equal("true");
  });
});
