"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "charts_users",
          "defaultGroup",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("charts_users", "defaultGroup")
    ]);
  }
};
