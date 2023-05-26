"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("certain_permissions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      route_id: Sequelize.UUID,
      user_id: Sequelize.UUID,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      stime: Sequelize.BIGINT,
      ltime: Sequelize.BIGINT,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      removed: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        defaultValue: 0
      },
      allow_user: Sequelize.BOOLEAN
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("certain_permissions");
  }
};
