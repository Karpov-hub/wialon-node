"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("organization_aggregator_account_permissions", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      organization_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      aggregator_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      maker: {
        type: Sequelize.UUID
      },
      signobject: {
        type: Sequelize.JSON
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("organization_aggregator_account_permissions", {
      schema: queryInterface.sequelize.options.schema
    });
  }
};
