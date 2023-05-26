"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("cards", "unit_id", {
      allowNull: true,
      type: Sequelize.BIGINT
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("cards", "unit_id");
  }
};