"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("plugins", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      removed: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("plugins");
  }
};
