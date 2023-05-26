"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "realms",
      [
        {
          id: "a4305d93-f719-4c8e-8263-1722810a69b7",
          name: "test server1",
          ip: "0.0.0.0",
          token: "111",
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("realms", null, {});
  }
};
