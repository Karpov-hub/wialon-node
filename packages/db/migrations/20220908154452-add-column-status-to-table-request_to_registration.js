"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "request_to_registration",
          "status",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "request_to_registration",
          "reject_reason",
          {
            type: Sequelize.TEXT,
            allowNull: true
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("request_to_registration", "status", {
          transaction: t
        }),
        queryInterface.removeColumn("request_to_registration", "reject_reason", {
          transaction: t
        }),
      ]);
    });
  }
};
