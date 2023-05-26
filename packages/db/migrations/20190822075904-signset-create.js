"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("signset", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      module: Sequelize.STRING(255),
      priority: Sequelize.JSON,
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      stime: Sequelize.BIGINT,
      ltime: Sequelize.BIGINT,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      makes: Sequelize.UUID,
      active: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("signset");
  }
};
