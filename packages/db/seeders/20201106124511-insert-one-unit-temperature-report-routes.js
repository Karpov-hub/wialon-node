'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "35f426c9-1ded-4699-8a2e-707f13277588",
          method: "buildReport",
		      service:"report-service",
          description: "One Unit Temperature Report",
          type: 1,
          organization_id: null,
          requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"},{"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"unit","display":"Select Unit","items":null,"method":"getAllUnits","service":"report-service"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_name: 'One Unit Temperature Report',
          report_id: "032b2619-e72d-4e6f-b649-748118b38757"
        }       
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});

  }
};