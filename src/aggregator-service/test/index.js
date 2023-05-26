import chai from "chai";
const expect = chai.expect;
let should = chai.should();

import Service from "../src/Service.js";
import db from "@lib/db";

const service = new Service({ name: "aggregator-service" });
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
const aggregatorsData = [
  {
    id: "7a90ac38-aa12-4e86-8eec-a7f5ec2cf0cd",
    name: "Aggregator1",
    host: "https://test.test",
    ctime: "2022-12-13T17:38:31Z",
    mtime: "2022-12-13T13:36:18Z",
    removed: 0,
    name_for_custom_field: "test",
    method_for_check: "test",
    service_for_method: "test",
    method_for_get_data: "test",
    api_key_required: true,
    log_pas_required: false,
    contract_number_required: false
  },
  {
    id: "e1579909-6b27-4383-908d-76059e06a990",
    name: "Aggregator2",
    host: "https://test.test",
    ctime: "2022-12-13T17:38:31Z",
    mtime: "2022-12-13T13:36:18Z",
    removed: 0,
    name_for_custom_field: "test",
    method_for_check: "test",
    service_for_method: "test",
    method_for_get_data: "test",
    api_key_required: false,
    log_pas_required: true,
    contract_number_required: false
  },
  {
    id: "a616f731-b53f-461b-b545-92f83a0ce7c4",
    name: "Aggregator3",
    host: "https://test.test",
    ctime: "2022-12-13T17:38:31Z",
    mtime: "2022-12-13T13:36:18Z",
    removed: 0,
    name_for_custom_field: "test",
    method_for_check: "test",
    service_for_method: "test",
    method_for_get_data: "test",
    api_key_required: false,
    log_pas_required: false,
    contract_number_required: true
  }
];
const accountRecordIds = [
  "76d3ff90-c2ee-47db-ac2e-6d3664d89aa6",
  "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4",
  "a24f956f-ff69-45a8-9297-72fd4c9bce4d"
];
const permissionAggregatorData = [
  {
    organization_id: organizationData.id,
    aggregator_id: aggregatorsData[0].id
  },
  {
    organization_id: organizationData.id,
    aggregator_id: aggregatorsData[1].id
  },
  {
    organization_id: organizationData.id,
    aggregator_id: aggregatorsData[2].id
  }
];

describe("Aggregator service", async () => {
  before(async () => {
    await db.organization.destroy({
      truncate: true,
      cascade: true
    });
    await db.aggregator.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization_aggregator_account_permissions.destroy({
      truncate: true,
      cascade: true
    });
    await db.organization_aggregator_accounts.destroy({
      truncate: true,
      cascade: true
    });
    await db.user_organization_aggregator_account_permissions.destroy({
      truncate: true,
      cascade: true
    });
    await db.user.destroy({
      truncate: true,
      cascade: true
    });

    await db.organization.create(organizationData);
    await db.user.create(userData);
    await db.aggregator.bulkCreate(aggregatorsData);
    await db.organization_aggregator_account_permissions.bulkCreate(
      permissionAggregatorData
    );
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

  describe("Aggregator service", () => {
    it("Get all aggregators", async () => {
      const res = await service.runServiceMethod({
        method: "getAllAggregators",
        data: {},
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
      res.should.not.have.deep.property("count", 0);
    });

    it("Attach Api Key to organization", async () => {
      const res = await service.runServiceMethod({
        method: "attachApiKeyLoginPasswordToOrganization",
        data: {
          record_id: accountRecordIds[0],
          aggregator_id: aggregatorsData[0].id,
          name: "test 1",
          api_key: "123qwe"
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Attach login password to organization", async () => {
      const res = await service.runServiceMethod({
        method: "attachApiKeyLoginPasswordToOrganization",
        data: {
          record_id: accountRecordIds[1],
          aggregator_id: aggregatorsData[1].id,
          name: "test 2",
          login: "test",
          password: "test"
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Attach contract number to organization", async () => {
      const res = await service.runServiceMethod({
        method: "attachApiKeyLoginPasswordToOrganization",
        data: {
          record_id: accountRecordIds[2],
          aggregator_id: aggregatorsData[2].id,
          name: "test 3",
          contract_number: "test123"
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Delete credentials for aggregator", async () => {
      const res = await service.runServiceMethod({
        method: "deleteCredentialsForAggregator",
        data: {
          organization_aggregator_account_id: accountRecordIds[0]
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Get all credentials of aggregators for organization", async () => {
      const res = await service.runServiceMethod({
        method: "getAllAggregatorOrganizationRecords",
        data: {},
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("items");
      res.items.should.have.deep.property("length", 2);
    });

    it("Update status organization aggregator account", async () => {
      const res = await service.runServiceMethod({
        method: "updateStatusOrganizationAggregatorAccount",
        data: {
          organization_aggregator_account_id: accountRecordIds[1],
          status: 3
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Set access to the organization aggregator account for the user", async () => {
      const res = await service.runServiceMethod({
        method: "setUserAccess",
        data: {
          user_id: userData.id,
          organization_aggregator_account_permissions: [
            {
              organization_aggregator_account_id: accountRecordIds[1],
              is_user_has_access: true
            }
          ]
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
    });

    it("Get organization aggregator accounts list with user permissions", async () => {
      const res = await service.runServiceMethod({
        method: "getUserAggregatorAccountPermissions",
        data: {
          user_id: userData.id
        },
        userId: userData.id,
        realmId: userData.realm
      });
      res.should.have.deep.property("success", true);
      res.should.not.have.deep.property("count", 0);
    });

    it("Get all accounts according the role of the user", async () => {
      const res = await service.runServiceMethod({
        method: "getAllOrganizationAggregatorAccounts",
        data: {},
        userId: userData.id,
        realmId: userData.realm
      });

      res.should.have.deep.property("success", true);

      res.should.have.deep.property("count");
      expect(res.count).is.greaterThan(0);

      res.should.have.deep.property("rows");
      expect(typeof res.rows).is.equal("object");
      expect(res.rows.length).is.greaterThan(0);

      res.rows[0].should.have.deep.property("id");
      expect(res.rows[0].id.length).is.equal(36);

      res.rows[0].should.have.deep.property("name");
      expect(res.rows[0].name.length).is.greaterThan(0);

      res.rows[0].should.have.deep.property("aggregator");
      expect(typeof res.rows[0].aggregator).is.equal("object");

      res.rows[0].aggregator.should.have.deep.property("id");
      expect(res.rows[0].aggregator.id.length).is.equal(36);

      res.rows[0].aggregator.should.have.deep.property("name");
      expect(res.rows[0].aggregator.name.length).is.greaterThan(0);
    });
  });
});
