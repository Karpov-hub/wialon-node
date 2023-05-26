'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "337a5da7-113a-4850-81b3-120e18672b57",
          method: "buildReport",
		  service:"report-service",
          description: "GPN Avtonavix - Group Report",
          type: 1,
          organization_id: null,
          requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"}, {"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"group_name","display":"Select group","items":null,"method":"getAllGroups","service":"report-service"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_name: 'GPN Avtonavix',
          report_id: "00a961d8-0722-4c8c-8037-27be50828262"
        }       
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});

  }
};