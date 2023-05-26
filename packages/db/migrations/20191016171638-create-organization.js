"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("organizations", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      wialon_username: {
        type: Sequelize.STRING
      },
      wialon_token: {
        type: Sequelize.UUID
      },
      wialon_hosting_url: {
        type: Sequelize.STRING
      },
      organization_name: {
        type: Sequelize.STRING
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("organizations");
  }
};
