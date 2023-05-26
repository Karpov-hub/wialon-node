"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("report_labels", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      report_id: {
        type: Sequelize.UUID,
        references: {
          model: "routes",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      lang: {
        type: Sequelize.STRING(2)
      },
      report_name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      removed: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
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
    return queryInterface.dropTable("report_labels");
  }
};
