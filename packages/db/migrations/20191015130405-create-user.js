"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(50)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      pass: {
        type: Sequelize.STRING(100)
      },
      organization_id: {
        type: Sequelize.UUID
      },
      role_id: {
        type: Sequelize.UUID
      },
      realm: {
        type: Sequelize.UUID
      },
      wialon_token: {
        type: Sequelize.STRING(100)
      },
      email_verified_at: {
        type: Sequelize.DATE
      },
      is_active: {
        type: Sequelize.BOOLEAN
      },
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
  down: (queryInterface, Sequelize) => {
    // return queryInterface.dropTable("users");
    return queryInterface.sequelize.query(
        'DROP TABLE users cascade')
   // return Promise.all([])
  }
};