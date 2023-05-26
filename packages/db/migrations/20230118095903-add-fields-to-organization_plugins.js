"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "organization_plugins",
          "last_activated_date",
          {
            type: Sequelize.DATE
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "organization_plugins",
          "plugin_fees",
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("organization_plugins", "plugin_fees"),
      queryInterface.removeColumn("organization_plugins", "last_activated_date")
    ]);
  }
};