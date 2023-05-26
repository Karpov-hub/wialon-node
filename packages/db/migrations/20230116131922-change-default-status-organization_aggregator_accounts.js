"use strict";
/**
 * status 1 - not approved
 * status 2 - in progress
 * status 3 - approved
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      "organization_aggregator_accounts",
      "status",
      {
        type: Sequelize.INTEGER,
        defaultValue: 3
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      "organization_aggregator_accounts",
      "status",
      {
        type: Sequelize.INTEGER,
        defaultValue: 2
      }
    );
  }
};
