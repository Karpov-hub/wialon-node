"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "preferred_language", {
      type: Sequelize.STRING(3),
      defaultValue: "EN",
      allowNull: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "preferred_language");
  }
};
