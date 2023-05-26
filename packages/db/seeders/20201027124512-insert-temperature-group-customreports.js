'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "78563915-f002-4167-8ee8-1d619af86e92",
          name: "Temperature Group Report",
          description: "Temperature Group Report",
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
