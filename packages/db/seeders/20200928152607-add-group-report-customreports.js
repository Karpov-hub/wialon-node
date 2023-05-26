'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "14819c3f-4605-4bd1-8874-67a0de28fea5",
          name: "Group report",
          description: "group basic report",
          ctime: new Date(),
          mtime: new Date(),
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("customreports", null, {});
  }
};