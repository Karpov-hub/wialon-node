'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "884f95cc-8b4d-4493-b767-dbf6f512747b",
          name: "Solo unit temperure fuel's",
          description: "Solo unit temperure fuel's",
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