"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("routes", "description", {
      type: Sequelize.STRING(500)
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("routes", "description", {
      type: Sequelize.STRING(255)
    });
  }
};
