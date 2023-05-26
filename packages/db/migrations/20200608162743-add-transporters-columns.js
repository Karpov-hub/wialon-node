"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "transporters",
          "removed",
          { type: Sequelize.INTEGER, defaulValue: 0 },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "transporters",
          "from_email",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "transporters",
          "name",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("transporters", "removed",{ transaction: t }),
        queryInterface.removeColumn("transporters", "from_email",{ transaction: t }),
        queryInterface.removeColumn("transporters", "name",{ transaction: t }),
      ]);
    });
  }
};
