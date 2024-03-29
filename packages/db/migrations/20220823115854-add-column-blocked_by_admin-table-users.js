"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "is_blocked_by_admin", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "is_blocked_by_admin"),
    ]);
  },
};
