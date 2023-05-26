"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("cards", "aggregator_id", {
      type: Sequelize.UUID,
      allowNull: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("cards", "aggregator_id", {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};
