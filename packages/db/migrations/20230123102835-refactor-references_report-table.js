'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("references_report", "name", { transaction: t }),
        queryInterface.addColumn(
          "references_report",
          "route_id",
          {
            type: Sequelize.UUID,
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("references_report", "route_id", { transaction: t }),
        queryInterface.addColumn(
          "references_report",
          "name",
          {
            type: Sequelize.STRING,
          },
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
