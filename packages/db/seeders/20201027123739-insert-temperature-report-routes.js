'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "6ce99dd7-e77c-488d-8f35-c884628f00d7",
          method: "buildReport",
		      service:"report-service",
          description: "Temperature Group Report",
          type: 1,
          organization_id: null,
          requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"}, {"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"group_name","display":"Select group","items":null,"method":"getAllGroups","service":"report-service"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_name: 'Temperature Group Report',
          report_id: "78563915-f002-4167-8ee8-1d619af86e92"
        }       
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});

  }
};