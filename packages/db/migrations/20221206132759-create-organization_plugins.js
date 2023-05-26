"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("organization_plugins", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      organization_id: Sequelize.UUID,
      plugin_id: Sequelize.UUID,
      status: Sequelize.INTEGER,
      is_cron_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    return queryInterface.dropTable("organization_plugins");
  }
};
