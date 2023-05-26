'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "19478232-e9ee-488f-b1e4-cf749dc77f75",
          method: "getProfileDetails",
		      service:"auth-service",
          description: "get the details of logged in user ",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "9fb97875-ea3a-4008-ae57-54c8982e6788",
          method: "getReport",
		      service:"auth-service",
          description: "get report from wialon ",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "ec03dfde-8a29-4f4b-b58f-69fda5ed45e5",
          method: "getRoutes",
		      service:"auth-service",
          description: "get all routes of laravel ",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "2dcb3525-cd12-4f72-902a-fb57bf9fddcc",
          method: "checkPermission",
		      service:"auth-service",
          description: "check if the user is allowed to create role",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "d13afc4e-e28d-44d4-8564-76c63fe621b8",
          method: "getPermissionInfo",
		      service:"auth-service",
          description: "get permission of all roles for route",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "fb3428fd-33ce-4cfd-9bca-0fb8617f3bef",
          method: "changePermission",
		      service:"auth-service",
          description: "change permission of all roles for route",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "b3cf5f9a-9874-4497-8cad-8def3472c064",
          method: "getReportSuperadmin",
		      service:"auth-service",
          description: "get report from wialon for superadmin",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "75262bb4-bcc8-46e5-a6e4-729b7a52bc0f",
          method: "getReportAdmin",
		      service:"auth-service",
          description: "get report from wialon for admin",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "74fc670e-f4f1-4df6-9805-6df09eac0ab7",
          method: "getPermittedRoutes",
		      service:"auth-service",
          description: "get permitted routes",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "984c7d68-e96f-4133-9798-50601fa48e5e",
          method: "customizedRequestReport",
		      service:"auth-service",
          description: "send mail for customized report",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "d47d3c99-8767-4948-b29e-fc6f64bb8d54",
          method: "getOrganizationUsers",
		      service:"auth-service",
          description: "get organization users",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "3c8959ef-0d5f-481e-9ea2-38d7518b427c",
          method: "toggleUserStatus",
		      service:"auth-service",
          description: "toggle user status",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "de82aba8-2a70-47c1-9b76-c575ebb1c02b",
          method: "getOrganizationDetails",
		      service:"auth-service",
          description: "get organization details",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "3122da72-c96c-4de1-a512-7f048cd39121",
          method: "updateOrganizationDetails",
		      service:"auth-service",
          description: "update organization details",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "580f07da-5a3a-4c3d-968b-ae2c5c96c87b",
          method: "buildReport",
		      service:"report-service",
          description: "Report With Sensors",
          type: 1,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "1cfb3d6d-80d3-4af8-a63b-2650d13b565a",
          method: "getReportRoutes",
		      service:"auth-service",
          description: "get routes of reports",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "cc329da4-bec7-403a-aaa6-a19769483af2",
          method: "inviteUser",
		      service:"auth-service",
          description: "invite users to organisation",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "3b8f8c93-73e1-4277-963d-3b6230dccb5a",
          method: "updateProfile",
		      service:"auth-service",
          description: "update profile",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "9e6bc524-5a8e-4739-936a-263ca0232dea",
          method: "validateEmail",
		      service:"auth-service",
          description: "validate email",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "033f7fb2-4025-4b52-a491-f80c95a1d940",
          method: "validateReportParams",
		      service:"auth-service",
          description: "validate report params",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "e55979b9-0dc3-48b8-813f-8db25a1e4b6a",
          method: "getAllUnits",
		      service:"auth-service",
          description: "get all units ",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "d5d9c2a2-eccd-4a35-863e-57118e04d3d8",
          method: "getGeneratedReports",
		      service:"auth-service",
          description: "get all generated reports stored on server",
          type: 0,
          organization_id: null,
          requirements: null,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('routes', null, {});
  }
};
