"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("routes", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      route: Sequelize.STRING,
      description: Sequelize.STRING,
      organization_id: Sequelize.UUID,
      type: Sequelize.INTEGER,
      requirements: Sequelize.STRING,
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("routes");
  }
};
