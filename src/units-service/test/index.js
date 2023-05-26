import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
import uuid from "chai-uuid";
chai.use(uuid);
const should = chai.should();
const expect = chai.expect;
import moment from 'moment';

import Service from "../src/Service.js";
const service = new Service({ name: "units-service" });

let organization_id;
let unitId = null;
let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";

let ENV;
let userId;
let wialonAccountIdGeneric = null;

describe("units service", async () => {
  before(async () => {
    await db.route.destroy({ truncate : true, cascade: true });
    await db.user.destroy({ truncate : true, cascade: true });
    await db.provider.destroy({ truncate : true, cascade: true });
    ENV = await pretest.before();  
  });
  
  after(async () => {       
    await db.organization.destroy({ truncate : true, cascade: true }); 
    await db.user.destroy({ truncate : true, cascade: true });
    await db.wialon_accounts.destroy({ truncate : true, cascade: true });
  });

  describe("Get Unit Resource Data", () => {
    it("Get Unit Resource Data", async () => {           
        await db.organization.destroy({
          truncate: true,
          cascade: true
        });

        let organizationData = {
          organization_name: "Anita891",
         removed: 0
        };
    
        let organization = await db.organization.create(organizationData);
        organization_id = organization.id;

        let userData = {
          name: "ab198",
          email: "ab198+1@enovate-it.com",
          pass: "ebfc7910077770c8340f63cd2dca2ac1f120444f",
          organization_id: organization_id,
          role_id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
          realm: "59adefc0-32a7-11ea-8c1e-ffc67778a55e",
          wialon_token: "aaaaae5242d5738fb1f28cb85da261b8b181e80080b9",
          email_verified_at: null,
          is_active: false
        };
    
        let user = await db.user.create(userData);
        userId = user.id;    
    
        let wialonAccountDataGeneric = {
          "wialon_username": 'generic',
          "wialon_token": "a6a50ab724a137468c0bd8c75b1767218E431A722F86A0BECAC6F60C0ECEBF8CB1DA6CDA",
          "wialon_hosting_url": "https://hst-api.wialon.com",
          "organization_id": organization_id          
        };
        db.wialon_accounts.destroy({
          truncate: true,
          cascade: true
        });

      let wialonAccountGeneric = await db.wialon_accounts.create(wialonAccountDataGeneric); 
      wialonAccountIdGeneric = wialonAccountGeneric.id;

        const res = await service.runServiceMethod({
          method: "getUnitResourceData",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            startsWith : 0,
            numOfRecords: 2
          },
          realmId: ENV.realmId,
          userId
        });
        res.should.have.deep.property("units");
        
        if(res.units.length > 0){
            unitId = res.units[0].unitId;
        }
      }).timeout(0);
  });   

  describe("get Unit Details Data", () => {    
    it("get Unit Details Data", async () => {                  
      if(unitId != null) {
        const res = await service.runServiceMethod({
          method: "getUnitDetailsData",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("unitId");  
        }      
      }).timeout(0);    
  });   

  describe("get Trip Details", () => {    
    it("get Trip Details", async () => {                  
      if(unitId != null) {
        const res = await service.runServiceMethod({
          method: "getTripDetails",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            dateRangeType: 1
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("overAllScore");  
        }      
      }).timeout(0);    
  });    

  describe("get Fuel Entries", () => {    
    it("get Fuel Entries", async () => {                  
      if(unitId != null) {
        const res = await service.runServiceMethod({
          method: "getFuelEntries",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            dateRangeType: 1
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("fuelEntries");  
        }      
      }).timeout(0);    
  });   

  describe("get Fuel Usage Details", () => {    
    it("get Fuel Usage Details", async () => {                  
      if(unitId != null) {
        const res = await service.runServiceMethod({
          method: "getFuelUsageDetails",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            dateRangeType: 1
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("fuelUsages");  
        }      
      }).timeout(0);    
  });   

  describe("get Utilization Cost Details", () => {    
    it("get Utilization Cost Details", async () => {                  
      if(unitId != null) {
        const res = await service.runServiceMethod({
          method: "getUtilizationCostDetails",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            dateRangeType: 1
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("utilizationCosts");  
        }      
      }).timeout(0);    
  });   

  describe("get Service Entries", () => {    
    it("get Service Entries", async () => {     
       if(unitId != null) {
        let toDate = moment(new Date());    
        let fromDate = moment(toDate).subtract(1, 'days');
     
        const res = await service.runServiceMethod({
          method: "getServiceEntries",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            fromDate: fromDate,
            toDate: toDate
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("serviceEntries");  
        }      
      }).timeout(0);    
  });

  describe("get Upcoming Maintenance", () => {    
    it("get Upcoming Maintenance", async () => {                  
      if(unitId != null) {
        let fromDate =  moment(new Date()).add(1, 'days');
        let toDate = moment(fromDate).add(1, 'days');
        
        const res = await service.runServiceMethod({
          method: "getUpcomingMaintenance",
          data: {  
            wialonAccountId : wialonAccountIdGeneric,
            unitId : unitId,
            fromDate: fromDate,
            toDate: toDate
          },
          realmId: ENV.realmId,
          userId
        });

        res.should.have.deep.property("upcomingServices");  
        }      
      }).timeout(0);    
  });
  
});
 