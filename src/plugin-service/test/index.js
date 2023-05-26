import chai from "chai";

let should = chai.should();

import Service from "../src/Service.js";
import db from "@lib/db";
import pretest from "@lib/pretest";

const service = new Service({ name: "plugin-service" });
const organizationData = {
  id: "00b2f244-1e17-4794-a685-a718d40fe748",
  organization_name: "id102",
  ctime: "2022-12-13T17:28:05Z",
  mtime: "2022-12-13T17:28:05Z",
  removed: 0
};
const userData = {
  id: "f1bfd19a-7afa-11ed-a1eb-0242ac120002",
  name: "id102",
  email: "id102@tadbox.com",
  pass: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  organization_id: "00b2f244-1e17-4794-a685-a718d40fe748",
  role_id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
  realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
  wialon_token: "aaaaae5242d5738fb1f28cb85da261b8b181e80080b9",
  email_verified_at: null,
  is_active: false,
  ctime: "2022-12-13T17:38:31Z",
  mtime: "2022-12-13T13:36:18Z"
};
const generatePluginsData = () => {
  const pluginsData = [];
  for (let i = 1; i < 8; i++) {
    pluginsData.push({
      id: `${i}f83801d-ed4b-4bf9-9164-f4038b7171f4`,
      name: `case ${i}`,
      ctime: "2022-12-13T17:28:05Z",
      mtime: "2022-12-13T17:28:05Z",
      removed: 0
    });
  }
  return pluginsData;
};
const generateOrganizationPluginsData = () => {
  const organizationPluginsData = [];
  for (let i = 1; i < 7; i++) {
    organizationPluginsData.push({
      id: `${i}243752e-b1cc-435c-aea1-804b54ea32c4`,
      plugin_id: pluginsData[i - 1].id,
      organization_id: organizationData.id,
      status: 2,
      plugin_fees: 100,
      last_deactivated_date: null,
      last_activated_date: null,
      ctime: "2020-12-13T17:28:05Z",
      mtime: "2020-12-13T17:28:05Z",
      removed: 0
    });
  }
  //case 1
  organizationPluginsData[0].last_activated_date = "2022-11-19T15:31:09Z";
  organizationPluginsData[0].last_deactivated_date = "2021-12-01T00:21:14Z";
  //case 2
  organizationPluginsData[1].last_activated_date = "2023-01-04T15:32:05Z";
  organizationPluginsData[1].last_deactivated_date = "2021-12-01T00:21:14Z";
  //case 3
  organizationPluginsData[2].last_activated_date = "2023-01-05T15:32:45Z";
  organizationPluginsData[2].last_deactivated_date = "2023-01-01T00:21:14Z";
  //case 4
  organizationPluginsData[3].last_activated_date = "2023-01-10T15:34:41Z";
  //case 5
  organizationPluginsData[4].last_activated_date = "2022-10-19T15:34:58Z";
  //case 6
  organizationPluginsData[5].last_activated_date = "2022-01-19T15:35:17Z";
  organizationPluginsData[5].last_deactivated_date = "2023-01-10T02:06:53Z";
  organizationPluginsData[5].status = 4;

  return organizationPluginsData;
};
const pluginsData = generatePluginsData();
const organizationPluginsData = generateOrganizationPluginsData();
const getAllPlugins = async () => {
  return await service.runServiceMethod({
    method: "getAllPlugins",
    data: {},
    userId: userData.id,
    realm: userData.realm
  });
};
const getApprovedOrganizationPlugins = async () => {
  return await service.runServiceMethod({
    method: "getApprovedOrganizationPlugins",
    data: {},
    userId: userData.id,
    realm: userData.realm
  });
};
const toggleCronOrganizationPlugin = async () => {
  return await service.runServiceMethod({
    method: "toggleCronOrganizationPlugin",
    data: {
      plugin_id: pluginsData[6].id
    },
    userId: userData.id,
    realmId: userData.realm
  });
};
let ENV;
describe("Plugin service", async () => {
  before(async () => {
    ENV = await pretest.before();
    await db.plugin.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization_plugin.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization.destroy({
      truncate: true,
      cascade: true
    });
    await db.user.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization.create(organizationData);
    await db.user.create(userData);
    await db.plugin.bulkCreate(pluginsData);
    await db.organization_plugin.bulkCreate(organizationPluginsData);
    // this code runs before all tests
  });

  after(function() {});

  describe("Ping", () => {
    it("Should return test-pong", async () => {
      const res = await service.runServiceMethod({
        method: "ping",
        data: {}
      });
    });
  });

  describe("Plugin service", () => {
    it("Get all plugins (Not Requested)", async () => {
      const res = await getAllPlugins();
      res.should.have.deep.property("success", true);
      res.items[6].should.have.deep.property("status", 0);
      res.should.have.deep.property("count", 7);
    });

    it("Calculation of commission for plugins for the period (activate on last period)", async () => {
      const fromDate = new Date("2022-12-20");
      const toDate = new Date("2023-01-19");
      const res = await service.runServiceMethod({
        method: "calculatePluginsFees",
        data: {
          from_date: fromDate,
          to_date: toDate,
          organization_id: userData.organization_id
        },
        userId: userData.id,
        realm: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Plugin connection request", async () => {
      const res = await service.runServiceMethod({
        method: "pluginConnectionRequest",
        data: {
          plugin_id: pluginsData[6].id
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all plugins (Requested)", async () => {
      const res = await getAllPlugins();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count", 7);
      res.items[6].should.have.deep.property("status", 1);
    });

    it("Get all organization plugins (Requested)", async () => {
      const res = await getApprovedOrganizationPlugins();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count", 5);
    });

    it("Update organization plugin status", async () => {
      const res = await service.runServiceMethod({
        method: "updateStatusOrganizationPlugin",
        data: {
          organization_id: organizationData.id,
          plugin_id: pluginsData[6].id,
          status: 2,
          plugin_fees: 100
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all plugins (Approved)", async () => {
      const res = await getAllPlugins();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count", 7);
      res.items[6].should.have.deep.property("status", 2);
    });

    it("Get all organization plugins (Approved)", async () => {
      const res = await getApprovedOrganizationPlugins();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("count", 6);
    });

    it("Toggle cron organization plugin", async () => {
      let res = await toggleCronOrganizationPlugin();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("enabled", true);

      res = await toggleCronOrganizationPlugin();
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("enabled", false);
    });
  });
});
