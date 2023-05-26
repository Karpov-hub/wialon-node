"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "salt",
          { type: Sequelize.STRING(128) },
          { transaction }
        ),
        queryInterface.changeColumn(
          "users",
          "pass",
          { type: Sequelize.STRING(128) },
          { transaction }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("users", "salt", {
          transaction: t
        }),
        queryInterface.changeColumn(
          "users",
          "pass",
          {
            type: Sequelize.STRING(100)
          },
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
