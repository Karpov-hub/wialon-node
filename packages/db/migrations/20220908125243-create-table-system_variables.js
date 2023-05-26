"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("system_variables", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      code: {
        type: Sequelize.STRING(256),
        allowNull: false
      },
      value: {
        type: Sequelize.STRING(1000),
        allowNull: false
      },
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
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      realm_id: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("system_variables");
  }
};
