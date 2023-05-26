"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "charts_users",
          "host",
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: "host"
          },
          {
            transaction: t
          }
        ),

        queryInterface.addColumn(
          "charts_users",
          "engineReportResource",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),

        queryInterface.addColumn(
          "charts_users",
          "engineReportTemplate",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),

        queryInterface.addColumn(
          "charts_users",
          "ecoReportResource",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),

        queryInterface.addColumn(
          "charts_users",
          "ecoReportTemplate",
          {
            type: Sequelize.STRING
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
      queryInterface.removeColumn("charts_users", "host"),
      queryInterface.removeColumn("charts_users", "engineReportResource"),
      queryInterface.removeColumn("charts_users", "engineReportTemplate"),
      queryInterface.removeColumn("charts_users", "ecoReportResource"),
      queryInterface.removeColumn("charts_users", "ecoReportTemplate")
    ]);
  }
};
