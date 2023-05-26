"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      // return Promise.all([
      //   queryInterface.addColumn(
      //     "realms",
      //     "tariff",
      //     {
      //       type: Sequelize.UUID
      //     },
      //     {
      //       transaction: t
      //     }
      //   ),
      //   queryInterface.addColumn(
      //     "admin_users",
      //     "state",
      //     {
      //       type: Sequelize.INTEGER
      //     },
      //     {
      //       transaction: t
      //     }
      //   )
      // ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {});
  }
};
