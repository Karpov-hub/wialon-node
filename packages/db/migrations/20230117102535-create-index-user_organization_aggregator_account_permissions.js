"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `create unique index permission on user_organization_aggregator_account_permissions (user_id, organization_aggregator_account_id)`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(
      "user_organization_aggregator_account_permissions",
      "permission"
    );
  }
};
