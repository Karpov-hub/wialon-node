"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "organizations",
          "billing_day",
          {
            type: Sequelize.INTEGER,
            defaultValue: 28
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
      queryInterface.removeColumn("organizations", "billing_day")
    ]);
  }
};
