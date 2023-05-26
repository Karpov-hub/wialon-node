"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("admin_users", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      login: {
        type: Sequelize.STRING
      },
      pass: {
        type: Sequelize.STRING
      },
      superuser: Sequelize.INTEGER,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      tel: Sequelize.STRING,
      email: Sequelize.STRING,
      name: Sequelize.STRING,
      stime: Sequelize.BIGINT,
      ltime: Sequelize.BIGINT,
      removed: Sequelize.INTEGER,
      ip: Sequelize.STRING(15),
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      xgroups: Sequelize.JSON,
      position: Sequelize.STRING,
      status: Sequelize.CHAR,
      dblauth: Sequelize.INTEGER,
      groupid: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("admin_users");
  }
};
