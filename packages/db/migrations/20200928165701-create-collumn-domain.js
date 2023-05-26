"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "realms",
          "domain",
          { type: Sequelize.STRING(255) },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
        return Promise.all([
          queryInterface.removeColumn(
            "realms",
            "domain",
            { transaction: t }
          )
        ]);
      });
    }
};
