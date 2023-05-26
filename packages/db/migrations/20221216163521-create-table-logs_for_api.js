"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("logs_for_api", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_id: {
        allowNull: true,
        type: Sequelize.UUID
      },
      message: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      data: {
        allowNull: true,
        type: Sequelize.TEXT
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
    return queryInterface.dropTable("logs_for_api", {
      schema: queryInterface.sequelize.options.schema
    });
  }
};
