"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "roles",
      [
        {
          id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
          role: "Admin",
          description: "admin",
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "c17e7bd8-f0c6-11e9-81b4-2a2ae2dbcce4",
          role: "SuperAdmin",
          description: "super admin",
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
          role: "User",
          description: "user",
          removed: 0,
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    // return queryInterface.bulkDelete("admin_users", null, {});
    return queryInterface.bulkDelete("roles", null, {});
  }
};
