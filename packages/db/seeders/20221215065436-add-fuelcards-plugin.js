'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "plugins",
      [
        {
          id: "ee7c4508-7c45-11ed-a1eb-0242ac120002",
          name: "Fuel Cards",
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("plugins", null, {});
  }
};
