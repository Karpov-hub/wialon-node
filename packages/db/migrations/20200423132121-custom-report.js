"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("customreports", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      owner: {
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING(255),
      },
      description: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.TEXT,
      },
      docker_id: {
        type: Sequelize.STRING(100),
      },
      ctime: {
        type: Sequelize.DATE,
      },
      mtime: {
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("customreports");
  },
};
