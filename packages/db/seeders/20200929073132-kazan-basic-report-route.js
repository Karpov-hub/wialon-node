'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "1cafbeb3-d5f2-4c85-9c96-9637c7493687",
          method: "buildReport",
		      service:"report-service",
          description: "Kazan - Group Basic Report",
          type: 2,
          organization_id: "4c492d20-d0ba-11ea-9018-819d37a12d21",
          requirements: '[{"type":"DP","name":"startDate","display":"Start Date"},{"type":"DP","name":"endDate","display":"End Date"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_name: 'kazan-group',
          report_id: "57802189-f51d-4ec5-89d6-8faf3e2bf82e"
        }       
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});

  }
};