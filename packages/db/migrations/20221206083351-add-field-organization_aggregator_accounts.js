"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "organization_aggregator_accounts",
      "status",
      {
        type: Sequelize.INTEGER,
        defaultValue: 2
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'organization_aggregator_accounts',
      'status'
    );
  }
};
