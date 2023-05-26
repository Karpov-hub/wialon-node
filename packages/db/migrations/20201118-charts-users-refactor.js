"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "charts_users",
          "mailing",
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
      queryInterface.removeColumn("charts_users", "mailing")
    ]);
  }
};
