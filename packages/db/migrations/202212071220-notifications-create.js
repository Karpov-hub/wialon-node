"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("notifications", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      level: Sequelize.STRING,
      search_pattern: Sequelize.STRING,
      search_flags: Sequelize.STRING,
      channels: Sequelize.JSONB,
      receivers: Sequelize.STRING,
      delay: Sequelize.BIGINT,
      enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
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
    return queryInterface.dropTable("notifications");
  }
};
