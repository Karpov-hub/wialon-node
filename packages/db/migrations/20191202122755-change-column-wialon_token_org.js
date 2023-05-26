"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("organizations", "wialon_token", {
      type: Sequelize.STRING
    });
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("organizations", "wialon_token"),
      queryInterface.addColumn(
        "organizations", "wialon_token",
        { type: Sequelize.UUID },
      ),
    ]);
  }
};
