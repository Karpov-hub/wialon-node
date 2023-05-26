"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("references_report", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(100)
      },
      description: {
        type: Sequelize.TEXT
      },
      file_id: {
        type: Sequelize.JSON
      },
      file_name: {
          type: Sequelize.JSON
      },
      file_size: {
          type: Sequelize.JSON
      },
      realm_id: {
        type: Sequelize.UUID
      },
      user_id: {
          type: Sequelize.UUID
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
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
    return queryInterface.dropTable("references_report");
  }
};
