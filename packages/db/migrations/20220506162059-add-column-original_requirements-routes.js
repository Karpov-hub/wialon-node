"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "routes",
          "original_requirements",
          {
            type: Sequelize.STRING(1000),
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
      queryInterface.removeColumn("routes", "original_requirements"),
    ]);
  }
};
