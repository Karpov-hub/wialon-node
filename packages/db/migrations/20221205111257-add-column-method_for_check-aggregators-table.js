"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("aggregators", "method_for_check", {
        type: Sequelize.STRING(255),
        allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("aggregators", "method_for_check");
  }
};
