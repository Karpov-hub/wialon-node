"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "organization_plugins",
      "last_deactivated_date",
      {
        type: Sequelize.DATE
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("organization_plugins", "last_deactivated_date");
  }
};
