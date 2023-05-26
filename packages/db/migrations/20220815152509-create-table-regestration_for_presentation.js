"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("registation_for_presentation", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(255)
      },
      company: {
        type: Sequelize.STRING(255)
      },
      website: {
        type: Sequelize.STRING(255)
      },
      email: {
        type: Sequelize.STRING(256)
      },
      is_wialon_accounts_exists: {
        type: Sequelize.BOOLEAN
      },
      is_order_make_or_self: {
        type: Sequelize.INTEGER
      },
      wishes: {
        type: Sequelize.TEXT
      },
      phone_number: {
        type: Sequelize.STRING(20)
      },
      stime: {
        type: Sequelize.BIGINT
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
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
        type :Sequelize.UUID
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
        'DROP TABLE registation_for_presentation cascade')
  }
};