"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("organizationaggregators", {
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
      api_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      login: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("organizationaggregators", {
      schema: queryInterface.sequelize.options.schema
    });
  }
};
