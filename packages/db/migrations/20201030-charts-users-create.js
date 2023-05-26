"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("charts_users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      wialon_id: Sequelize.INTEGER,
      token: Sequelize.STRING,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("charts_users");
  }
};
