"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("groups", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      groupname: Sequelize.STRING,
      code: Sequelize.STRING,
      description: Sequelize.STRING,
      desktopclassname: Sequelize.STRING,
      autorun: Sequelize.STRING,
      modelaccess: Sequelize.JSON,
      reportsaccess: Sequelize.JSON,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      ltime: Sequelize.BIGINT,
      stime: Sequelize.BIGINT,
      removed: Sequelize.INTEGER,
      pagesaccess: Sequelize.CHAR,
      apiaccess: Sequelize.JSON,
      name: Sequelize.STRING(255),
      desktopclasname: Sequelize.STRING(255)
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("groups");
  }
};
