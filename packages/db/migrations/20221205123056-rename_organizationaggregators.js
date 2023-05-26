"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable(
      "organizationaggregators",
      "organization_aggregator_accounts"
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable(
      "organization_aggregator_accounts",
      "organizationaggregators"
    );
  }
};
