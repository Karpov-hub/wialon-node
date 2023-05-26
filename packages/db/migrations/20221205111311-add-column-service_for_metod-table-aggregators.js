"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("aggregators", "service_for_method", {
        type: Sequelize.STRING(255),
        allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("aggregators", "service_for_method");
  }
};
