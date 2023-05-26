"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tickets", "file_id", {
          transaction: t,
        }),
        queryInterface.addColumn(
          "tickets",
          "file_id",
          { type: Sequelize.JSON },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tickets", "file_id", {
          transaction: t,
        }),
        queryInterface.addColumn(
          "tickets",
          "file_id",
          { type: Sequelize.UUID },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
