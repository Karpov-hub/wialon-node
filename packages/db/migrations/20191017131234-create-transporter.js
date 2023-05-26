"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("transporters", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      host_transporter: Sequelize.STRING(20),
      port_transporter: Sequelize.INTEGER,
      secure_transporter: Sequelize.BOOLEAN,
      user_transporter: Sequelize.STRING(30),
      password_transporter: Sequelize.STRING(40),

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("transporters");
  }
};
