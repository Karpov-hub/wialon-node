'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "routes",
      [
        {
          id: "d58ce7a6-b94f-4076-b719-09658bbac190",
          method: "buildReport",
		      service:"report-service",
          description: "Group basic report",
          type: 1,
          organization_id: null,
          requirements: '[{"type":"DTP","name":"startDate","display":"Start Date"}, {"type":"DTP","name":"endDate","display":"End Date"},{"type":"S","name":"group_name","display":"Select group","items":null,"method":"getAllGroups","service":"report-service"}]',
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          report_id: "14819c3f-4605-4bd1-8874-67a0de28fea5"
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("routes", null, {});
  }
};
