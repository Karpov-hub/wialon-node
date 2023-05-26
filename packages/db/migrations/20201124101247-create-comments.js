"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("comments", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      ticket_id: {
        type: Sequelize.UUID,
      },
      sender: {
        type: Sequelize.STRING,
      },
      receiver: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.TEXT,
      },
      file_id: {
        type: Sequelize.UUID,
      },
      realm_id: {
        type: Sequelize.UUID,
      },
      is_user_message: {
        type: Sequelize.BOOLEAN,
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      maker: {
        type: Sequelize.UUID,
      },
      signobject: {
        type: Sequelize.JSON,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("comments");
  },
};
