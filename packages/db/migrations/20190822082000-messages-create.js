"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("messages", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },

      subject: Sequelize.STRING,
      body: Sequelize.TEXT,
      to_name: Sequelize.JSON,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      ltime: Sequelize.BIGINT,
      stime: Sequelize.BIGINT,
      removed: Sequelize.INTEGER,

      fromuser: Sequelize.STRING,
      touser: Sequelize.JSON,
      new: Sequelize.INTEGER,

      owner: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("messages");
  }
};
