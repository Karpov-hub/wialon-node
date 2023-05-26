"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.allSettled([
        queryInterface.addColumn(
          "admin_users",
          "state",
          {
            type: Sequelize.INTEGER,
            defaultValue: 1
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {});
  }
};
