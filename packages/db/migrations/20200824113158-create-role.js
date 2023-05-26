"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "roles",
          "maker",
          { type: Sequelize.UUID },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "roles",
          "signobject",
          { type: Sequelize.JSON },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([])
  },
};
