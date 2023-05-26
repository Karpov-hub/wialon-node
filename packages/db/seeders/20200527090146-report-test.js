"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "9f851016-d295-4c94-8a16-9736e243d4ec",
          name: "Test report",
          description: "Test report",
          code: "-",
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("customreports", null, {});
  }
};
