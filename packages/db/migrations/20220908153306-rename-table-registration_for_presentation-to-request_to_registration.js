"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("registation_for_presentation", "request_to_registration");
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("request_to_registration", "registation_for_presentation");
  }
};
