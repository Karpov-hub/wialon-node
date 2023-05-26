"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "routes",
          "service",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),
        queryInterface.renameColumn("routes", "route", "method", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("routes", "service"),
      queryInterface.renameColumn("routes", "method", "route")
    ]);
  }
};
