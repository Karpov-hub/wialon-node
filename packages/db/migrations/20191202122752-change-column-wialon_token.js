"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "wialon_token", {
      type: Sequelize.STRING
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "wialon_token", {
      type: Sequelize.STRING(100)
    });
  }
};
