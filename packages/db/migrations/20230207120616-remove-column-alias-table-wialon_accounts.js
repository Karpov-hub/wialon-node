"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("wialon_accounts", "alias")
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "wialon_accounts",
          "alias",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
