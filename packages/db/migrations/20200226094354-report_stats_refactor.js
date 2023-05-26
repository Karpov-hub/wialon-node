"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("report_stats", "report_params", {
      type: Sequelize.STRING(1000)
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("report_stats", "report_params", {
      type: Sequelize.STRING
    });
  }
};
