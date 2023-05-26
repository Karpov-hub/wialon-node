"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tickets", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      number_of_ticket: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.TEXT,
      },
      file_id: {
        type: Sequelize.UUID,
      },
      file_name: {
        type: Sequelize.JSON,
      },
      file_size: {
        type: Sequelize.JSON,
      },
      user_id: {
        type: Sequelize.UUID,
      },
      realm_id: {
        type: Sequelize.UUID,
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      new: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tickets");
  },
};
