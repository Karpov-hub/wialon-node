"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "cards",
      "organization_aggregator_account_id",
      {
        type: Sequelize.UUID,
        allowNull: false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "cards",
      "organization_aggregator_account_id"
    );
  }
};
