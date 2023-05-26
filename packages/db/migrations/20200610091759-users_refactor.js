"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.allSettled([
        queryInterface.changeColumn(
          "users",
          "userlevel",
          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.allSettled([
        queryInterface.changeColumn(
          "users",
          "userlevel",
          { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
          { transaction: t }
        ),
      ]);
    });
  }
};
