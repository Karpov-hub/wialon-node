"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "admin_users",
      [
        {
          _id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4",
          login: "yeti",
          pass: "ebfc7910077770c8340f63cd2dca2ac1f120444f",
          superuser: 1,
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("admin_users", null, {});
  }
};
