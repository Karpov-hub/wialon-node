"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("rates_packages", "fixed_monthly_fees_fuc", { transaction: t }),
        queryInterface.addColumn(
          "invoices",
          "plugins_fees_amount",
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "invoices",
          "plugins_fees",
          {
            type: Sequelize.JSON
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
        queryInterface.removeColumn("invoices", "plugins_fees", { transaction: t }),
        queryInterface.removeColumn("invoices", "plugins_fees_amount", { transaction: t }),
        queryInterface.addColumn(
          "rates_packages",
          "fixed_monthly_fees_fuc",
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
          },
          {
            transaction: t
          }
        )
      ]);
    });
  }
};