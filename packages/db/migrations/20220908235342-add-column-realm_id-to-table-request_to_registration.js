"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "request_to_registration",
          "realm_id",
          {
            type: Sequelize.UUID,
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "request_to_registration",
          "lang",
          {
            type: Sequelize.STRING(2),
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
        queryInterface.removeColumn("request_to_registration", "realm_id", {
          transaction: t
        }),
        queryInterface.removeColumn("request_to_registration", "lang", {
          transaction: t
        })
      ]);
    });
  }
};
