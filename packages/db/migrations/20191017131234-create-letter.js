"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("letters", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      realm: {
        type: Sequelize.UUID
      },
      code: Sequelize.TEXT,
      letter_name: Sequelize.STRING,
      from: Sequelize.STRING,
      to: Sequelize.STRING,
      subject: Sequelize.STRING,
      text: Sequelize.TEXT,
      html: Sequelize.TEXT,

      transporter: Sequelize.UUID,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("letters");
  }
};
