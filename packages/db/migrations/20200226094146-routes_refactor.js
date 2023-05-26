"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("routes", "requirements", {
      type: Sequelize.STRING(1000)
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("routes", "requirements", {
      type: Sequelize.STRING
    });
  }
};
