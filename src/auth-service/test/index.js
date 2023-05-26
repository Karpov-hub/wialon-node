import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
import FileProvider from "@lib/fileprovider";
import sha1 from "sha1";
import { createSalt, hashPassword } from "@lib/utils";
import uuid from "chai-uuid";
import uuidGeneratror from "uuid";
chai.use(uuid);
import MemStore from "@lib/memstore";
const should = chai.should();
const expect = chai.expect;
import Cryptr from "cryptr";
const cryptr = new Cryptr("LJ273L48vaDKkQ6D");

import Service from "../src/Service.js";
import { randomBytes } from "crypto";
import config from "@lib/config";

const service = new Service({ name: "auth-service" });

const captchaToken = randomBytes(32).toString("hex");
let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
file.name = "testImage.png";

let ENV;
let userId = null; // id of the owner of the organization
let invitedUserId = null;
let hash;
const adminEmail = "id102@tadbox.com";
const userEmail = "id102+23@tadbox.com";
let organizationId = null;
let requestId = null;
let userPassword = "V3ryStr0ngPassw0rd!#$";
let authToken = null;
let organizationName = "Some Company name";
let wialonAccountId = null;
let reportIdToDownload = null;
let idForProvider = null;

const routeId = "580f07da-5a3a-4c3d-968b-ae2c5c96c87b";
const roleId = "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4";

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

const getCaptchaText = async () => {
  await service.runServiceMethod({
    method: "getCaptcha",
    data: { token: captchaToken },
    realmId: ENV.realmId
  });
  return await MemStore.get("cpt" + captchaToken);
};

describe("Auth service", async () => {
  before(async () => {
    await db.user.destroy({ truncate: true, cascade: true });
    await db.organization.destroy({ truncate: true, cascade: true });
    await db.Permissions.destroy({ truncate: true, cascade: true });
    // await db.letter.destroy({ truncate: true, cascade: true });
    await db.tax_information.destroy({ truncate: true, cascade: true });
    await db.rates_package.destroy({ truncate: true, cascade: true });
    await db.package_subscription.destroy({ truncate: true, cascade: true });
    await db.invoice.destroy({ truncate: true, cascade: true });
    await db.provider.destroy({ truncate: true, cascade: true });

    ENV = await pretest.before();
    await MemStore.del("blk" + sha1("test-corp@test.ru-" + ENV.realmId));

    await db.provider.create({
      id: "df34ada1-ffe2-4a2f-aad6-f1301c95b050",
      code: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18",
      filename: "bill.txt",
      file_size: 10,
      mime_type: "text/plain",
      upload_date: new Date(),
      storage_date: new Date().setSeconds(new Date().getSeconds() + 300),
      ctime: new Date(),
      mtime: new Date(),
      removed: 0
    });
  });

  after(async () => {
    await db.role.destroy({ truncate: true, cascade: true });
    await db.route.destroy({ truncate: true, cascade: true });
    await db.user.destroy({ truncate: true, cascade: true });
    await db.provider.destroy({ truncate: true, cascade: true });
    await db.organization.destroy({ truncate: true, cascade: true });
    await db.Permissions.destroy({ truncate: true, cascade: true });
    // await db.letter.destroy({ truncate: true, cascade: true });
    //await MemStore.del("blk" + sha1("test-corp@test.ru-" + ENV.realmId));
  });

  describe("Process of the registartion", async () => {
    it("Send request to Registration in Repogen", async () => {
      const res = await service.runServiceMethod({
        method: "registrationForPresentation",
        data: {
          name: "Some Username",
          company: organizationName,
          website: "some.website.com",
          is_wialon_accounts_exists: true,
          wishes: "Some whiches from user",
          phone_number: "+7123456789",
          email: adminEmail
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id");

      requestId = res.id;
    });

    it("Approve user and create organization for them", async () => {
      const res = await service.runServiceMethod({
        method: "signupAdminFromAdminPanel",
        data: {
          email: "id102@tadbox.com",
          name: "Some Username",
          organization_name: organizationName,
          lang: "EN",
          realm_id: ENV.realmId,
          id_of_record: requestId
        }
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id");

      userId = res.id;
    });

    it("Approve user and create organization for them\n\t(should return success: false, cause wrong format of the email)", async () => {
      const res = await service.runServiceMethod({
        method: "signupAdminFromAdminPanel",
        data: {
          email: "123", //dummy email
          name: "Some Username",
          organization_name: organizationName,
          lang: "EN",
          realm_id: ENV.realmId,
          id_of_record: requestId
        }
      });

      res.should.have.deep.property("success", false);
      res.should.have.deep.property("title");
      res.should.have.deep.property("message", "Invalid passed data.");
    });

    it("Approve user and create organization for them\n\t(should return success: false, cause passed email already registered)", async () => {
      const res = await service.runServiceMethod({
        method: "signupAdminFromAdminPanel",
        data: {
          email: "id102@tadbox.com",
          name: "Some Username",
          organization_name: organizationName,
          lang: "EN",
          realm_id: ENV.realmId,
          id_of_record: requestId
        }
      });
      res.should.have.deep.property("success", false);
      res.should.have.deep.property("title");
      res.should.have.deep.property(
        "message",
        "User with passed email already exists in the system!"
      );
    });

    it("Reject the user request", async () => {
      // once again create the request
      const requestResult = await service.runServiceMethod({
        method: "registrationForPresentation",
        data: {
          name: "Some Username",
          company: organizationName,
          website: "some.website.com",
          is_wialon_accounts_exists: true,
          wishes: "Some whiches from user",
          phone_number: "+7123456789",
          email: "mcstera+1@proton.me"
        },
        realmId: ENV.realmId
      });

      // reject the request, instead of accept
      const res = await service.runServiceMethod({
        method: "rejectUserRequest",
        data: {
          email: "id102+1@tadbox.com",
          realm_id: ENV.realmId,
          id: requestResult.id
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Reject the user request\n\t(should return success:false, cause id of record is wrong)", async () => {
      // once again create the request
      const requestResult = await service.runServiceMethod({
        method: "registrationForPresentation",
        data: {
          name: "Some Username",
          company: organizationName,
          website: "some.website.com",
          is_wialon_accounts_exists: true,
          wishes: "Some whiches from user",
          phone_number: "+7123456789",
          email: "mcstera@proton.me"
        },
        realmId: ENV.realmId
      });

      // reject the request, instead of accept
      const res = await service.runServiceMethod({
        method: "rejectUserRequest",
        data: {
          email: "id102@tadbox.com",
          realm_id: ENV.realmId,
          id: uuidGeneratror.v4()
        }
      });
      res.should.have.deep.property("success", false);
    });
  });

  //compromise, i.e. I can't get the password, that was sent to user, need to change it manually
  describe("Login, logout and recovery password", async () => {
    it("Change the password to know the password of the user and login", async () => {
      const newSalt = createSalt();
      await db.user.update(
        { pass: hashPassword("Passw0rd!", newSalt), salt: newSalt },
        {
          where: {
            id: userId
          }
        }
      );
    });

    it("Login user", async () => {
      const res = await service.runServiceMethod({
        method: "signin",
        data: {
          login: "id102@tadbox.com",
          pass: "Passw0rd!"
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("token");

      authToken = res.token;
    });

    it("Login user\n\t(should return 'LOGINERROR', cause wrong password)", async () => {
      // signout to signin again
      // first failure try
      await service.runServiceMethod({
        method: "signout",
        data: { token: authToken },
        realmId: ENV.realmId
      });
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "id102@tadbox.com",
            pass: "WRONGPASSWORD" // wrong password
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINERROR");
      }
    });
    it("Login user\n\t(should return 'LOGINERROR', cause wrong login)", async () => {
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "ag103@tadbox.com", // wrong login
            pass: "Passw0rd!"
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINERROR");
      }
    });

    it("Login user\n\t(should return 'LOGINERROR', cause wrong all credentials)", async () => {
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "ag103@tadbox.com", // wrong login
            pass: "WRONGPASSWORD" // wrong password
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINERROR");
      }
    });

    it("Login user\n\t(should return 'LOGINERROR', cause wrong password, second failure try)", async () => {
      // second failure try
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "id102@tadbox.com",
            pass: "WRONGPASSWORD" // wrong password
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINERROR");
      }
    });

    it("Login user\n\t(should return 'LOGINERROR', cause wrong password, third failure try)", async () => {
      // third failure try
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "id102@tadbox.com",
            pass: "WRONGPASSWORD" // wrong password
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINERROR");
      }
    });

    it("Login user\n\t(should return 'LOGINBLOCKED', cause three failures try to signin)", async () => {
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "id102@tadbox.com", // correct login
            pass: "Passw0rd!" // correct password
          },
          realmId: ENV.realmId
        });
      } catch (e) {
        expect(e).equal("LOGINBLOCKED");
      }
    });

    //compromise, i.e. I can't remove record from redis via API about blocked login, need to remove it manually
    it("Delete record from redis about blocked login", async () => {
      const res = await MemStore.del(
        "blk" + sha1(adminEmail + "-" + ENV.realmId)
      );

      expect(res).equal(1);
    });

    it("Recovery password", async () => {
      const user = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "pass", "salt"]
      });

      const res = await service.runServiceMethod({
        method: "passwordReminder",
        data: {
          email: adminEmail
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);

      const updatedUser = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "pass", "salt"]
      });
      expect(user.pass === updatedUser.pass).equal(false);
      expect(user.salt === updatedUser.salt).equal(false);

      const newSalt = createSalt();
      await db.user.update(
        { pass: hashPassword("Passw0rd!", newSalt), salt: newSalt },
        {
          where: {
            id: userId
          }
        }
      );
    });

    it("Login user (once again to continue work with application)", async () => {
      const res = await service.runServiceMethod({
        method: "signin",
        data: {
          login: "id102@tadbox.com",
          pass: "Passw0rd!"
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("token");

      authToken = res.token;
    });
  });

  describe("Change user profile and organization name (user name, user password)", () => {
    it("Update only username", async () => {
      const newName = "Ivan Danilenko";
      const res = await service.runServiceMethod({
        method: "updateProfile",
        data: {
          name: newName
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id", userId);
      res.should.have.deep.property("email", adminEmail);
      res.should.have.deep.property("name", newName);
    });

    it("Update only password", async () => {
      const newPassword = "Passw0rd!#";
      const oldUserData = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "name", "pass", "salt"]
      });
      const res = await service.runServiceMethod({
        method: "updateProfile",
        data: {
          password: newPassword
        },
        realmId: ENV.realmId,
        userId
      });

      const updatedUserData = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "name", "pass", "salt"]
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id", userId);

      res.should.have.deep.property("email", adminEmail);
      res.should.have.deep.property("name", oldUserData.name);
      expect(updatedUserData.pass).equal(
        hashPassword(newPassword, updatedUserData.salt)
      );
      expect(oldUserData.pass).not.equal(updatedUserData.pass);
    });

    it("Update user name and password", async () => {
      const newName = "Updated name";
      const newPassword = "Passw0rd!1#";
      const oldUserData = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "name", "pass", "salt"]
      });

      const res = await service.runServiceMethod({
        method: "updateProfile",
        data: {
          name: newName,
          password: newPassword
        },
        realmId: ENV.realmId,
        userId
      });

      const updatedUserData = await db.user.findByPk(userId, {
        raw: true,
        attributes: ["id", "name", "pass", "salt"]
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id", userId);

      res.should.have.deep.property("email", adminEmail);
      res.should.have.deep.property("name", newName);

      expect(updatedUserData.pass).equal(
        hashPassword(newPassword, updatedUserData.salt)
      );
      expect(oldUserData.pass).not.equal(updatedUserData.pass);
    });

    it("Update user name and password (should return 'NAMEORPASSWORDEXPECTED', cause passed nothing)", async () => {
      try {
        await service.runServiceMethod({
          method: "updateProfile",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("NAMEORPASSWORDEXPECTED");
      }
    });

    it("Get more data about user profile", async () => {
      const res = await service.runServiceMethod({
        method: "getProfileDetails",
        data: {},
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("id", userId);
      res.should.have.deep.property("email", adminEmail);
      res.should.have.deep.property("role", "Admin");
      res.should.have.deep.property("access_level", 1);
      res.should.have.deep.property("is_billing_enabled", false);
      res.should.have.deep.property(
        "is_report_template_generator_enabled",
        false
      );
      res.should.have.deep.property("preferred_language", "EN");
    });
    it("Change the preferred language", async () => {
      const res = await service.runServiceMethod({
        method: "updatePreferredLang",
        data: { lang: "RU" },
        realmId: ENV.realmId,
        userId
      });

      const user = await db.user.findByPk(userId, {
        raw: true
      });

      res.should.have.deep.property("success", true);
      user.should.have.deep.property("preferred_language", "RU");
    });
  });

  describe("Get the organization details, invite a new user to organization,\nchange the organization name, set permissions on the account of external resources, \nblock the users in the organization", () => {
    it("Get Organization Details", async () => {
      const res = await service.runServiceMethod({
        method: "getOrganizationDetails",
        data: {},
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("organization");
      expect(typeof res.organization).equal("object");

      res.organization.should.have.deep.property(
        "organization_name",
        organizationName
      );

      organizationId = res.organization.id;
    });

    it("Edit organization name", async () => {
      const newOrganizationName = "Updated organization name";
      const res = await service.runServiceMethod({
        method: "updateOrganizationDetails",
        data: {
          organization_name: newOrganizationName
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("organization");
      expect(typeof res.organization).equal("object");

      res.organization.should.have.deep.property("id", organizationId);
      res.organization.should.have.deep.property(
        "organization_name",
        newOrganizationName
      );
    });

    it("Invite new user to current organization", async () => {
      const res = await service.runServiceMethod({
        method: "inviteUser",
        data: {
          email: userEmail
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("encrypted_string");

      expect(cryptr.decrypt(res.encrypted_string)).equal(
        `${userEmail}+${organizationId}`
      );
    });

    it("Invite new user to current organization\n\t(should return 'USEREXISTS')", async () => {
      const newUserEmail = "id102@tadbox.com";
      try {
        await service.runServiceMethod({
          method: "inviteUser",
          data: {
            email: newUserEmail
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("USEREXISTS");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'CAPTCHAEXPECTED', cause not passed captcha)", async () => {
      try {
        await service.runServiceMethod({
          method: "signupUser",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("CAPTCHAEXPECTED");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'CAPTCHAEXPECTED', cause not passed captcha)", async () => {
      try {
        await service.runServiceMethod({
          method: "signupUser",
          data: {
            token: captchaToken,
            captchaText: "wrong_value_of_captcha",
            email: adminEmail
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("CAPTCHAEXPECTED");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'INVALIDEMAIL', cause passed invalid format of email)", async () => {
      try {
        const captchaText = await getCaptchaText();
        await service.runServiceMethod({
          method: "signupUser",
          data: {
            token: captchaToken,
            captcha: captchaText,
            email: "wrong_format_email",
            password: ""
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("INVALIDEMAIL");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'INVALIDPASSWORD', cause passed emprt string)", async () => {
      try {
        const captchaText = await getCaptchaText();
        await service.runServiceMethod({
          method: "signupUser",
          data: {
            token: captchaToken,
            captcha: captchaText,
            email: userEmail,
            password: ""
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("INVALIDPASSWORD");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'INVALIDPASSWORD', cause password is not approved by policy of the password of the system)", async () => {
      try {
        const captchaText = await getCaptchaText();
        await service.runServiceMethod({
          method: "signupUser",
          data: {
            token: captchaToken,
            captcha: captchaText,
            email: userEmail,
            password: "too_easy_password"
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("INVALIDPASSWORD");
      }
    });

    it("Signup the invited user in current organization\n\t(should return 'ORGANIZATIONNOTFOUND', cause passed id of orgainzation that is not exists in the system)", async () => {
      try {
        const captchaText = await getCaptchaText();
        await service.runServiceMethod({
          method: "signupUser",
          data: {
            token: captchaToken,
            captcha: captchaText,
            email: userEmail,
            password: userPassword,
            organization_id: uuidGeneratror.v4()
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("ORGANIZATIONNOTFOUND");
      }
    });

    it("Signup the invited user in current organization", async () => {
      const captchaText = await getCaptchaText();
      const userName = "Some name of the user in organization";
      const res = await service.runServiceMethod({
        method: "signupUser",
        data: {
          token: captchaToken,
          captcha: captchaText,
          email: userEmail,
          password: userPassword,
          organization_id: organizationId,
          name: userName
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("id");
      res.should.have.deep.property("email", userEmail);
      res.should.have.deep.property("organization_id", organizationId);
      res.should.have.deep.property("realm", ENV.realmId);
      res.should.have.deep.property("is_active", true);
      res.should.have.deep.property("name", userName);
      res.should.have.deep.property("removed", 0);
      res.should.have.deep.property("userlevel", 2);

      invitedUserId = res.id;
    });

    it("Get Organization Users", async () => {
      const res = await service.runServiceMethod({
        method: "getOrganizationUsers",
        data: {},
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("users");
      expect(typeof res.users).equal("object");
      expect(res.users.length).equal(2);
    });

    it("Change Organization User Status", async () => {
      const res = await service.runServiceMethod({
        method: "toggleUserStatus",
        data: {
          user_id: invitedUserId
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("id", invitedUserId);
      res.res.should.have.deep.property("is_active", false);
      res.res.should.have.deep.property("is_blocked_by_admin", true);
    });

    it("Change Organization User Status\n\t(should return 'USERCANNOTBLOCKTHEMSELF', cause admin try to block them themself)", async () => {
      try {
        await service.runServiceMethod({
          method: "toggleUserStatus",
          data: {
            user_id: userId
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("USERCANNOTBLOCKTHEMSELF");
      }
    });

    it("Change Organization User Status\n\t(should return 'USERNOTFOUND', cause passed wrong user id value)", async () => {
      try {
        await service.runServiceMethod({
          method: "toggleUserStatus",
          data: {
            user_id: uuidGeneratror.v4() //wrong id, this case impossible to do from outside, cause realm and user checking are not pass this value
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("USERNOTFOUND");
      }
    });
    it("Send request to get Sandbox access", async () => {
      const res = await service.runServiceMethod({
        method: "requestToGetSandboxAccess",
        data: {},
        realmId: ENV.realmId,
        userId
      });

      res.should.have.property("success", true);
      res.should.have.property("currentStatus", 2);
    });

    it("Send request to get Sandbox access \n\t(as User, should return 'ACCESSDENIED', cause invited user has no access to the send request to sandbox)", async () => {
      try {
        await service.runServiceMethod({
          method: "requestToGetSandboxAccess",
          data: {},
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Send request to get Sandbox access \n\t(should return 'ORGANIZATIONALREADYREQUESTEDSANDBOXACCESS', cause request already was sent)", async () => {
      try {
        await service.runServiceMethod({
          method: "requestToGetSandboxAccess",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("ORGANIZATIONALREADYREQUESTEDSANDBOXACCESS");
      }
    });

    it("Grant organization access to sandbox", async () => {
      await db.organization.update(
        {
          sandbox_access_status: 3
        },
        {
          where: {
            id: organizationId
          }
        }
      );
    });

    it("Send request to get Sandbox access \n\t(should return 'ORGANIZATIONALREADYHASSANDBOXACCESS', cause already granted access)", async () => {
      try {
        await service.runServiceMethod({
          method: "requestToGetSandboxAccess",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("ORGANIZATIONALREADYHASSANDBOXACCESS");
      }
    });

    it("Reject organization access to sandbox", async () => {
      await db.organization.update(
        {
          sandbox_access_status: 4
        },
        {
          where: {
            id: organizationId
          }
        }
      );
    });

    it("Send request to get Sandbox access \n\t(should return 'ORGANIZATIONSANDBOXREQUESTWASREJECTED', cause request to access was rejected)", async () => {
      try {
        await service.runServiceMethod({
          method: "requestToGetSandboxAccess",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("ORGANIZATIONSANDBOXREQUESTWASREJECTED");
      }
    });

    it("Deactivate organization access to sandbox", async () => {
      await db.organization.update(
        {
          sandbox_access_status: 5
        },
        {
          where: {
            id: organizationId
          }
        }
      );
    });

    it("Send request to get Sandbox access \n\t(should return 'ORGANIZATIONSANDBOXACCESSWASDEACTIVATED', cause access to sandbox was deactivated)", async () => {
      try {
        await service.runServiceMethod({
          method: "requestToGetSandboxAccess",
          data: {},
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("ORGANIZATIONSANDBOXACCESSWASDEACTIVATED");
      }
    });
  });

  describe("Wialon Accounts Flow", () => {
    it("Add Wialon Account", async () => {
      const newWialonAcccountName = "Some Wialon Account Name";
      const newWialonAccountToken = "valueofthetoken";
      const newWialonAccountHostingUrl = config.wialon_hosting;

      const res = await service.runServiceMethod({
        method: "addWialonAccount",
        data: {
          wialon_username: newWialonAcccountName,
          wialon_token: newWialonAccountToken,
          wialon_hosting_url: newWialonAccountHostingUrl // url of the localhost mock server
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("dataValues");
      expect(typeof res.res.dataValues).equal("object");

      res.res.dataValues.should.have.deep.property(
        "wialon_username",
        newWialonAcccountName
      );
      res.res.dataValues.should.have.deep.property(
        "wialon_token",
        newWialonAccountToken
      );
      res.res.dataValues.should.have.deep.property(
        "wialon_hosting_url",
        newWialonAccountHostingUrl
      );
      res.res.dataValues.should.have.deep.property(
        "organization_id",
        organizationId
      );
      res.res.dataValues.should.have.deep.property("id");

      wialonAccountId = res.res.dataValues.id;
    });

    it("Add Wialon Account\n\t(should return 'TOKENEXISTS', cause passed token already exists in the system)", async () => {
      try {
        await service.runServiceMethod({
          method: "addWialonAccount",
          data: {
            wialon_username: "Some Wialon Account Name",
            wialon_token: "valueofthetoken",
            wialon_hosting_url: config.wialon_hosting // url of the localhost mock server
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("TOKENEXISTS");
      }
    });

    it("Try to add Wialon Account as invited user\n\t(should return 'ACCESSDENIED', cause invited user has not permission this action)", async () => {
      try {
        await service.runServiceMethod({
          method: "addWialonAccount",
          data: {
            wialon_username: "Some Wialon Account Name",
            wialon_token: "valueofthetoken",
            wialon_hosting_url: config.wialon_hosting // url of the localhost mock server
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });
    it("List Wialon Accounts", async () => {
      const res = await service.runServiceMethod({
        method: "listWialonAccounts",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");
      expect(res.res.length).equal(1);
    });
    it("List Wialon Accounts (should return 'ACCESSDENIED', cause invited user has not permission this action)'", async () => {
      try {
        await service.runServiceMethod({
          method: "listWialonAccounts",
          data: {
            start: null,
            limit: null
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });
    it("Set Accounts Access", async () => {
      const wialonAccount = await db.wialon_accounts.findByPk(wialonAccountId, {
        raw: true
      });

      const res = await service.runServiceMethod({
        method: "setAccountsAccess",
        data: {
          userId: invitedUserId,
          accountsId: [wialonAccount.id]
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");
      expect(res.res.length).greaterThanOrEqual(1);
    });

    it("Set Accounts Access\n\t(should return 'ACCESSDENIED', cause the invited user has no permission perfom this action)", async () => {
      try {
        await service.runServiceMethod({
          method: "setAccountsAccess",
          data: {
            userId: invitedUserId,
            accountsId: []
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Set Accounts Access\n\t(should return 'EXTERNALACCOUNTNOTFOUND', cause passed the not existing id of the record)", async () => {
      try {
        await service.runServiceMethod({
          method: "setAccountsAccess",
          data: {
            userId: invitedUserId,
            accountsId: [123456789123456789]
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("EXTERNALACCOUNTNOTFOUND");
      }
    });

    it("List Wialon Accounts for User (as User)", async () => {
      const res = await service.runServiceMethod({
        method: "listWialonAccountsForUser",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId: invitedUserId
      });
      res.should.have.deep.property("success", true);
      expect(typeof res.res).equal("object");
      expect(res.res.length).greaterThanOrEqual(1);
    });

    it("List Wialon Accounts for User (as Admin)", async () => {
      const res = await service.runServiceMethod({
        method: "listWialonAccountsForUser",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      expect(typeof res.res).equal("object");
      expect(res.res.length).equal(0); // cause admin no needs in permissions
    });

    it("List User Wialon Accounts", async () => {
      const res = await service.runServiceMethod({
        method: "listUserWialonAccounts",
        data: {
          userId: invitedUserId
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      expect(res.res.length).greaterThanOrEqual(1);
      expect(res.count).greaterThanOrEqual(1);
    });

    it("List Wialon Accounts To Generate Report (as Admin)", async () => {
      const res = await service.runServiceMethod({
        method: "listWialonAccountsToGenerateReport",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).greaterThanOrEqual(1);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");
      expect(res.res.length).greaterThanOrEqual(1);

      res.res[0].should.have.deep.property("id");
      res.res[0].should.have.deep.property("organization_id", organizationId);
    });

    it("List Wialon Accounts To Generate Report (as User)", async () => {
      const res = await service.runServiceMethod({
        method: "listWialonAccountsToGenerateReport",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).greaterThanOrEqual(1);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");
      expect(res.res.length).greaterThanOrEqual(1);

      res.res[0].should.have.deep.property("id");
      res.res[0].should.have.deep.property("organization_id", organizationId);
    });

    it("Remove Wialon Account", async () => {
      const res = await service.runServiceMethod({
        method: "removeWialonAccount",
        data: {
          wialon_acc_id: wialonAccountId
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("res", 1);
    });

    it("Remove Wialon Account\n\t(should return 'RECORDNOTFOUND', cause passed random record id of wialon account)", async () => {
      try {
        await service.runServiceMethod({
          method: "removeWialonAccount",
          data: {
            wialon_acc_id: 123456789123456789
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });

    it("Remove Wialon Account (as User)\n\t(should return 'ACCESSDENIED', cause invited user can't do this action)", async () => {
      try {
        await service.runServiceMethod({
          method: "removeWialonAccount",
          data: {
            wialon_acc_id: 123456789
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });
  });

  describe("Reports Flow", () => {
    it("Get Report Routes", async () => {
      const res = await service.runServiceMethod({
        method: "getReportRoutes",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
    });
    it("List Genertaed Reports", async () => {
      //Create Provider
      idForProvider = uuidGeneratror.v4();
      await db.provider.create({
        code: idForProvider,
        filename: "report.xlsx",
        file_size: 5442,
        mime_type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upload_date: new Date(),
        storage_date: null,
        removed: 0
      });
      //Create Report Stats
      const reportStats = await db.report_stats.create({
        organization_id: organizationId,
        user_id: userId,
        route_id: routeId,
        provider_id: idForProvider,
        report_generation_time: 3.129,
        report_size: 25564,
        report_params: "{}",
        status: 1
      });
      const res = await service.runServiceMethod({
        method: "listGenertatedReports",
        data: {
          start: null,
          limit: null
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).greaterThanOrEqual(1);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");
      expect(res.res.length).greaterThanOrEqual(1);

      reportIdToDownload = reportStats.dataValues.id;
    });
    it("Get link to download the generated report", async () => {
      const res = await service.runServiceMethod({
        method: "downloadReport",
        data: {
          reportId: reportIdToDownload
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("downloadUrl");
      expect(res.res.downloadUrl.includes(`download/${idForProvider}`)).equal(
        true
      );
    });
    it("Hide record of the generated reports", async () => {
      const res = await service.runServiceMethod({
        method: "hideRecordOfGeneratedReport",
        data: {
          id: reportIdToDownload
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
    });

    it("Hide record of the generated reports (should return 'REPORTNOTFOUND', cause passed not exists id in the system)", async () => {
      try {
        await service.runServiceMethod({
          method: "hideRecordOfGeneratedReport",
          data: {
            id: reportIdToDownload
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("REPORTNOTFOUND");
      }
    });
    it("Send customized Request Report (without file)", async () => {
      const res = await service.runServiceMethod({
        method: "customizedRequestReport",
        data: {
          text: "Some wishes of the user"
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
    });

    it("Send customized Request Report (with file)", async () => {
      const files = await prepareFiles([file]);
      const res = await service.runServiceMethod({
        method: "customizedRequestReport",
        data: {
          text: "Some wishes of the user",
          files: files
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
    });
  });
  describe("Invoice Usage Report Flow", () => {
    let invoice, tax, packageRecord;

    it("Create packange record, subscription for organization and tax information\n\t(can be created only inside the system by supervisor)", async () => {
      //Create rates_package
      packageRecord = await db.rates_package.create({
        package_name: "DefaultPackage",
        fixed_monthly_fees: 45.0,
        bytes_sent: 0.06,
        cpu_time_taken: 0.026,
        bytes_from_wialon: 0.13,
        no_of_employees: 2.0,
        no_of_wialon_acc: 1.0,
        is_offering_pkg: false,
        ctime: new Date(),
        mtime: new Date()
      });
      //Create package_subscription
      await db.package_subscription.create({
        organization_id: organizationId,
        rates_package_id: packageRecord.dataValues.id,
        from_date: "2018-03-24 12:27:35.765",
        ctime: new Date(),
        mtime: new Date()
      });
      //Create tax Information
      tax = await db.tax_information.create({
        percentage: 11.6,
        from_date: "2018-04-01 00:00:00",
        to_date: "2021-03-31 00:00:00",
        ctime: new Date(),
        mtime: new Date()
      });

      //TODO create the calling API and replace all code from CRON to API!!!
      //Create invoice
      invoice = await db.invoice.create({
        adjustment: 0,
        total_fees: 36282.59,
        from_date: "2020-02-29T18:30:00Z",
        to_date: "2020-03-30T18:30:00Z",
        invoice_date: "2020-03-31T18:30:00Z",
        bytes_sent: 5441,
        cpu_time_taken: 7.955,
        bytes_from_wialon: 76710,
        no_of_employees: 7,
        no_of_wialon_acc: 4,
        tax_id: tax.dataValues.id,
        organization_id: organizationId,
        ctime: new Date(),
        mtime: new Date()
      });
    });

    it("Get Invoices", async () => {
      const res = await service.runServiceMethod({
        method: "getInvoices",
        data: {
          year: 2020,
          start: 0,
          limit: 5
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).greaterThanOrEqual(1);

      res.should.have.deep.property("list");
      expect(Array.isArray(res.list)).equal(true);
      res.list.should.have.deep.property("length");
      expect(res.list.length).greaterThanOrEqual(1);
    });

    it("Get Invoices\n\t(as User, should return 'ACCESSDENIED', cause invited user can't get Invoices)", async () => {
      try {
        await service.runServiceMethod({
          method: "getInvoices",
          data: {
            year: 2020,
            start: 0,
            limit: 5
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Get Invoices\n\t(should return 0 invoices, cause no one invoices no has been created in 2010)", async () => {
      const res = await service.runServiceMethod({
        method: "getInvoices",
        data: {
          year: 2010,
          start: 0,
          limit: 5
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).equal(0);

      res.should.have.deep.property("list");
      expect(Array.isArray(res.list)).equal(true);
      res.list.should.have.deep.property("length");
      expect(res.list.length).equal(0);
    });
    it("Get Invoice Details", async () => {
      const res = await service.runServiceMethod({
        method: "getInvoiceDetails",
        data: {
          invoiceId: invoice.id
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("invoice");
      expect(typeof res.invoice).equal("object");

      res.invoice.should.have.deep.property("packages");
      expect(Array.isArray(res.invoice.packages)).equal(true);

      res.invoice.should.have.deep.property("organization_name");
      res.invoice.should.have.deep.property("tax_percentage");
      res.invoice.should.have.deep.property("from_date");
      res.invoice.should.have.deep.property("to_date");
      res.invoice.should.have.deep.property("invoice_date");
      res.invoice.should.have.deep.property("total_amount");
      res.invoice.should.have.deep.property("adjustment");
      res.invoice.should.have.deep.property("plugins_fees_amount");

      res.invoice.should.have.deep.property("resources");
      expect(Array.isArray(res.invoice.resources)).equal(true);
    });

    it("Get Invoice Details\n\t(as User, should return 'ACCESSDENIED', cause invited user can't get Invoice details)", async () => {
      try {
        await service.runServiceMethod({
          method: "getInvoiceDetails",
          data: {
            invoiceId: invoice.id
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Get Invoice Details\n\t(should return 'RECORDNOTFOUND', cause passed not exists id of the invoice)", async () => {
      try {
        await service.runServiceMethod({
          method: "getInvoiceDetails",
          data: {
            invoiceId: uuidGeneratror.v4()
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });
    it("Download Invoice", async () => {
      const res = await service.runServiceMethod({
        method: "downloadInvoice",
        data: {
          invoiceId: invoice.id,
          lang: "RU"
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("downloadUrl");
    });

    it("Download Invoice\n\t(as User, should return 'ACCESSDENIED', cause invited user can't download Invoice')", async () => {
      try {
        await service.runServiceMethod({
          method: "downloadInvoice",
          data: {
            invoiceId: invoice.id,
            lang: "RU"
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Download Invoice\n\t(should return 'RECORDNOTFOUND', cause passed not exists the invoice id)", async () => {
      try {
        await service.runServiceMethod({
          method: "downloadInvoice",
          data: {
            invoiceId: uuidGeneratror.v4(),
            lang: "RU"
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });
    it("Generate Usage Reports", async () => {
      const res = await service.runServiceMethod({
        method: "getUsageReport",
        data: {
          invoiceId: invoice.id
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count");

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("from_date");
      res.res.should.have.deep.property("to_date");
      res.res.should.have.deep.property("total_amount");
      res.res.should.have.deep.property("organisation_name");

      res.res.should.have.deep.property("list");
      expect(Array.isArray(res.res.list)).equal(true);
    });

    it("Generate Usage Reports\n\t(as User, should return 'ACCESSDENIED', cause invited user can't generate Usage Reports)", async () => {
      try {
        await service.runServiceMethod({
          method: "getUsageReport",
          data: {
            invoiceId: invoice.id
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Generate Usage Reports\n\t(should return 'RECORDNOTFOUND', cause passed not exists id of the invoice in the system)", async () => {
      try {
        await service.runServiceMethod({
          method: "getUsageReport",
          data: {
            invoiceId: uuidGeneratror.v4()
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });

    it("Download Usage Reports", async () => {
      const res = await service.runServiceMethod({
        method: "downloadUsageReport",
        data: {
          invoiceId: invoice.id,
          lang: "RU"
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      expect(typeof res.res).equal("object");

      res.res.should.have.deep.property("downloadUrl");
    });

    it("Download Usage Reports\n\t(as User, should return 'ACCESSDENIED', cause invited user can't download usage Report)", async () => {
      try {
        await service.runServiceMethod({
          method: "downloadUsageReport",
          data: {
            invoiceId: invoice.id,
            lang: "RU"
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Download Usage Reports\n\t(should return 'RECORDNOTFOUND', cause passed not exists id of the Invoice)", async () => {
      try {
        await service.runServiceMethod({
          method: "downloadUsageReport",
          data: {
            invoiceId: uuidGeneratror.v4(),
            lang: "RU"
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });
  });
  describe("Permissions Flow", () => {
    it("Get Permission Info", async () => {
      const res = await service.runServiceMethod({
        method: "getPermissionInfo",
        realmId: ENV.realmId,
        userId,
        data: {}
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count");
      res.should.have.deep.property("offset");
      res.should.have.deep.property("limit");

      res.should.have.deep.property("routes");

      res.routes.should.have.deep.property("basic");
      expect(Array.isArray(res.routes.basic)).equal(true);

      res.routes.should.have.deep.property("generic");
      expect(Array.isArray(res.routes.generic)).equal(true);

      res.routes.should.have.deep.property("customize");
      expect(Array.isArray(res.routes.customize)).equal(true);
    });

    it("Get Permission Info\n\t(as User, should return 'ACCESSDENIED', cause invited user can't get Permission Info)", async () => {
      try {
        await service.runServiceMethod({
          method: "getPermissionInfo",
          realmId: ENV.realmId,
          userId: invitedUserId,
          data: {}
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });
    it("Get Permission Info By Type and Organization of logined User", async () => {
      const res = await service.runServiceMethod({
        method: "getRoutesByTypeAndOrganization",
        data: {
          start: 0,
          limit: 5,
          type: 1
        },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count");
      res.should.have.deep.property("offset");
      res.should.have.deep.property("limit");

      res.should.have.deep.property("routes");
      expect(Array.isArray(res.routes)).equal(true);
    });

    it("Get Permission Info By Type and Organization of logined User\n\t(as User, should return 'ACCESSDENIED', cause invited user can't get Permissions Info)", async () => {
      try {
        await service.runServiceMethod({
          method: "getRoutesByTypeAndOrganization",
          data: {
            start: 0,
            limit: 5,
            type: 1
          },
          realmId: ENV.realmId,
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });
    it("Change permission of route for specific role to false", async () => {
      const res = await service.runServiceMethod({
        method: "changePermission",
        realmId: ENV.realmId,
        data: {
          role_id: roleId,
          route_id: routeId,
          is_permissible: false
        },
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      res.res.should.have.deep.property("dataValues");
      expect(res.res.dataValues.is_permissible).equal(false);
    });

    it("Change permission of route for specific role to true", async () => {
      const res = await service.runServiceMethod({
        method: "changePermission",
        realmId: ENV.realmId,
        data: {
          role_id: roleId,
          route_id: routeId,
          is_permissible: true
        },
        userId
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("res");
      res.res.should.have.deep.property("dataValues");
      res.res.dataValues.should.have.deep.property("route_id", routeId);
      res.res.dataValues.should.have.deep.property("role_id", roleId);
      expect(res.res.dataValues.is_permissible).equal(true);
    });

    it("Change permission of route for specific role\n\t(as User, should return 'ACCESSDENIED', cause invited user can't change Permissions on the Routes)", async () => {
      try {
        await service.runServiceMethod({
          method: "changePermission",
          realmId: ENV.realmId,
          data: {
            role_id: roleId,
            route_id: routeId,
            is_permissible: false
          },
          userId: invitedUserId
        });
      } catch (e) {
        expect(e).equal("ACCESSDENIED");
      }
    });

    it("Change permission of route for specific role (should return 'RECORDNOTFOUND', cause passed not exists id of the Route)", async () => {
      try {
        await service.runServiceMethod({
          method: "changePermission",
          realmId: ENV.realmId,
          data: {
            role_id: roleId,
            route_id: uuidGeneratror.v4(),
            is_permissible: false
          },
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });

    it("Change permission of route for specific role (should return 'RECORDNOTFOUND', cause passed not exists ids of the Route and of the Role)", async () => {
      try {
        await service.runServiceMethod({
          method: "changePermission",
          realmId: ENV.realmId,
          data: {
            role_id: uuidGeneratror.v4(),
            route_id: uuidGeneratror.v4(),
            is_permissible: false
          },
          userId
        });
      } catch (e) {
        expect(e).equal("RECORDNOTFOUND");
      }
    });
  });

  describe("Check the functional of the File provider", () => {
    it("Push file", async () => {
      const res = await service.runServiceMethod({
        method: "pushFile",
        realmId: ENV.realmId,
        userId,
        data: {
          name: "electricity_bill.png",
          data: file.data
        }
      });
      res.should.have.deep.property("code").to.not.be.a("undefined");
      res.should.have.deep.property("success", true);

      res.should.have.deep.property("size");
      expect(res.size).greaterThan(0);

      file.code = res.code;
      file.name = "electricity_bill.png";
      file.size = res.size;
      file.sendData = file.data;
    });
    it("Pull file", async () => {
      const res = await service.runServiceMethod({
        method: "pullFile",
        realmId: ENV.realmId,
        userId,
        data: {
          code: file.code
        }
      });
      res.should.have.deep.property("name").to.not.be.a("undefined");
      res.should.have.deep.property("size").to.not.be.a("undefined");
      res.should.have.deep.property("data").to.not.be.a("undefined");
      res.should.have.deep.property("name").to.equal(file.name);
      res.should.have.deep.property("size").to.equal(file.size);
      res.should.have.deep.property("data").to.equal(file.sendData);
    });
    // it("Watermark file", async () => {
    //   const res = await service.runServiceMethod({
    //     method: "watermarkFile",
    //     realmId: ENV.realmId,
    //     userId,
    //     data: {
    //       code: file.code
    //     }
    //   });
    //   res.should.have.deep.property("success", true);
    // });
    it("Accept file", async () => {
      const res = await service.runServiceMethod({
        method: "acceptFile",
        realmId: ENV.realmId,
        userId,
        data: [
          {
            name: "bill.txt",
            code: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18"
          },
          {
            name: "electricity_bill.png",
            code: file.code
          }
        ]
      });
      res.should.have.deep.property("success", true);
    });
    it("Status file", async () => {
      const res = await service.runServiceMethod({
        method: "statusFile",
        realmId: ENV.realmId,
        userId,
        data: {
          code: file.code
        }
      });
      res.should.have.deep.property("name").to.not.be.a("undefined");
      res.should.have.deep.property("size").to.not.be.a("undefined");
      res.should.have.deep.property("name").to.equal(file.name);
      res.should.have.deep.property("size").to.equal(file.size);
    });
    it("Delete file", async () => {
      const res = await service.runServiceMethod({
        method: "delFile",
        realmId: ENV.realmId,
        userId,
        data: {
          code: file.code
        }
      });
      res.should.have.deep.property("code").to.not.be.a("undefined");
      res.should.have.deep.property("code").to.equal(file.code);
      res.should.have.deep.property("success", true);
    });
  });
  describe("Custom Report Access Flow", () => {
    it("Get Custom Report Access", async () => {
      const res = await service.runServiceMethod({
        method: "getCustomReportAccess",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success").to.not.be.a("undefined");
      res.should.have.deep
        .property("customReportAccess")
        .to.not.be.a("undefined");
      res.should.have.deep.property("success", true);
      res.should.have.deep
        .property("customReportAccess")
        .to.equal(res.customReportAccess);
    });
    it("Set Custom Report Access ", async () => {
      const res = await service.runServiceMethod({
        method: "setCustomReportAccess",
        data: { customReportAccess: 1 },
        realmId: ENV.realmId,
        userId
      });

      res.should.have.deep.property("success").to.not.be.a("undefined");
      res.should.have.deep.property("success", true);
      expect(res.res.dataValues.custom_report_access).to.equal(1);
    });
  });
});
