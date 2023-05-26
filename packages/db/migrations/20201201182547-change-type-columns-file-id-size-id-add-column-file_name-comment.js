"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("comments", "file_id", { transaction: t }),
        queryInterface.addColumn(
          "comments",
          "file_id",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "comments",
          "file_name",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "comments",
          "file_size",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("comments", "file_id", { transaction: t }),
        queryInterface.removeColumn("comments", "file_name", {
          transaction: t,
        }),
        queryInterface.removeColumn("comments", "file_size", {
          transaction: t,
        }),
        queryInterface.addColumn(
          "comments",
          "file_id",
          {
            type: Sequelize.UUID,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
