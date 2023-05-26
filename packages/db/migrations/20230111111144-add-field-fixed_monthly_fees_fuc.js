'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
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
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("rates_packages", "fixed_monthly_fees_fuc"),
    ]);
  }
};
