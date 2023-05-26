'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "57802189-f51d-4ec5-89d6-8faf3e2bf82e",
          name: "kazan-group",
          description: "Kazan Group Basic Report",
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