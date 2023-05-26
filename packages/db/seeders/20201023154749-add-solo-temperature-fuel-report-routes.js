'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "8f060fd9-274c-409b-83c6-9803fddf5dde",
          method: "buildReport",
		  service:"report-service",
          description: "Solo unit temperure fuel's",
          type: 2,
          organization_id: "e50823a0-dd66-11ea-a145-05eb27bb3dd4",
          requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"},{"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"unit","display":"Select Unit","items":null,"method":"getAllUnits","service":"report-service"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_id: "884f95cc-8b4d-4493-b767-dbf6f512747b"
        },
        {
            id: "c77e0628-e689-4f59-bc2b-2a88fc550d97",
            method: "buildReport",
            service:"report-service",
            description: "Solo unit temperure fuel's",
            type: 2,
            organization_id: "161e0e90-f906-11ea-a145-05eb27bb3dd4",
            requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"},{"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"unit","display":"Select Unit","items":null,"method":"getAllUnits","service":"report-service"}]',
            removed: 0,
            ctime: new Date(),
            mtime: new Date(),
            report_id: "884f95cc-8b4d-4493-b767-dbf6f512747b"
          }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});

  }
};