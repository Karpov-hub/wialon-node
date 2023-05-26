'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "organization_plugins",
      "reject_reason",
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'organization_plugins',
      'reject_reason'
    );
  }
};
