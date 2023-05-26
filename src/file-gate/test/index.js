import db from "@lib/db";
import chai from "chai";
import chaiHttp from "chai-http";
import doc from "@lib/chai-documentator";

let should = chai.should();
chai.use(chaiHttp);
chai.use(require("chai-uuid"));

import fileGateServer from "../src/index";

describe("File gate", async () => {
  before(async () => {});

  after(async () => {});

  it("Download file", async () => {
    // let file = await db.provider.findOne({
    //   where: { removed: 0 }
    // });

    // const res = await doc(
    //   chai.request(fileGateServer).get(`/download/${file.dataValues.code}`)
    // );

    // res.res.should.have.deep.property("statusCode", 200);
    // res.res.should.have.deep.property("statusMessage", "OK");
  });
});
