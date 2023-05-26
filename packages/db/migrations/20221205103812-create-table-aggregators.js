"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("aggregators", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      host: {
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
    return queryInterface.dropTable("aggregators", {
      schema: queryInterface.sequelize.options.schema
    });
  }
};
