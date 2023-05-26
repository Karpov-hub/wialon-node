"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "realms",
      [
        {
          id: "df34ada1-ffe2-4a2f-aad6-f1301c95b050",
          name: "test server",
          ip: "0.0.0.0",
          token: "123",
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
