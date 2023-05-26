"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          "routes",
          "jasper_report_code",
          {
            allowNull: true,
            type: Sequelize.STRING(255)
          },
          { transaction }
        ),
        queryInterface.addColumn(
          "routes",
          "formats",
          {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: JSON.parse(JSON.stringify({ _arr: ["xlsx"] }))
          },
          { transaction }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn("routes", "jasper_report_code", {
          transaction
        }),
        queryInterface.removeColumn("routes", "formats", {
          transaction
        })
      ]);
    });
  }
};
