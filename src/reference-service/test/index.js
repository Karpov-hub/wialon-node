import chai from "chai";
import db from "@lib/db";
import uuidGenerator from "uuid";
import pretest from "@lib/pretest";
import FileProvider from "@lib/fileprovider";
const should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({
  name: "reference-service"
});

let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
file.name = "picture.png";

let uploadedFile;
let ENV;
let userId;
let referenceId;
let routeId;
const lang = "EN";

const prepareFiles = async (files) => {
  let fileData,
    out = [];
  try {
    for (let i = 0; i < files.length; i++) {
      fileData = await FileProvider.push(files[i], 300);
      if (fileData && fileData.success) {
        out.push({
          name: files[i].name,
          code: fileData.code,
          size: fileData.size
        });
      }
    }
  } catch (e) {
    console.error(e);
    throw "FILEUPLOADERROR";
  }
  return out;
};

describe("Reference service", async () => {
  before(async () => {
    await db.references_report.truncate();
    ENV = await pretest.before();
    userId = ENV.user1.dataValues.id;
    routeId = ENV.route1.dataValues.id;
  });

  describe("Create reference and get", () => {
    it("Create Reference", async () => {
      const files = await prepareFiles([file]);
      const referenceDescription = "Description of the reference";
      uploadedFile = files[0];
      const res = await service.runServiceMethod({
        method: "createReference",
        data: {
          ctime: new Date(),
          route_id: routeId,
          description: referenceDescription,
          realm_id: ENV.realmId,
          files: files,
          id: uuidGenerator.v4(),
          lang: lang
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("data");
      expect(typeof res.data).equal("object");

      res.data.should.have.deep.property("id");
      res.data.should.have.deep.property("route_id", routeId);
      res.data.should.have.deep.property("description", referenceDescription);

      res.data.should.have.deep.property("file_id");
      expect(res.data.file_id[0]).equal(uploadedFile.code);

      res.data.should.have.deep.property("file_name");
      expect(res.data.file_name[0]).equal(uploadedFile.name);

      res.data.should.have.deep.property("file_size");
      expect(res.data.file_size[0]).greaterThanOrEqual(1);

      res.data.should.have.deep.property("realm_id", ENV.realmId);
      res.data.should.have.deep.property("lang", lang);

      referenceId = res.data.id;
    });

    it("Get References", async () => {
      const res = await service.runServiceMethod({
        method: "getReferences",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get reference by lang and route_id", async () => {
      const res = await service.runServiceMethod({
        method: "getReference",
        data: {
          route_id: routeId,
          lang: lang
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("reference");
      expect(typeof res.reference).equal("object");

      res.reference.should.have.deep.property("lang", lang);
      res.reference.should.have.deep.property("route_id", routeId);
      res.reference.should.have.deep.property("description");
      res.reference.should.have.deep.property("id", referenceId);
    });

    it("Get reference by lang and route_id\n\t(should return 'NOREFERNCEFORSELECTEDREPORT', cause passed wrong route_id)", async () => {
      try {
        await service.runServiceMethod({
          method: "getReference",
          data: {
            route_id: uuidGenerator.v4(), //wrong route_id
            lang: lang
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("NOREFERNCEFORSELECTEDREPORT");
      }
    });

    it("Get reference by lang and route_id\n\t(should return 'NOREFERNCEFORSELECTEDREPORT', cause passed lang, that not exists)", async () => {
      try {
        await service.runServiceMethod({
          method: "getReference",
          data: {
            route_id: routeId,
            lang: "FR" //wrong lang
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("NOREFERNCEFORSELECTEDREPORT");
      }
    });
    it("Delete file from reference", async () => {
      const res = await service.runServiceMethod({
        method: "deleteFileFromReference",
        data: {
          recordData: {
            id: referenceId
          },
          file: {
            code: uploadedFile.code
          }
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("message", "File successfully deleted.");

      res.should.have.deep.property("data");
      expect(typeof res.data).equal("object");

      res.data.should.have.deep.property("id", referenceId);
      res.data.should.have.deep.property("route_id", routeId);
      res.data.should.have.deep.property("description");
    });
  });
});
