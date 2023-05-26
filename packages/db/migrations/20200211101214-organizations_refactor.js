'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("organizations", "wialon_username"),
      queryInterface.removeColumn("organizations", "wialon_token"),
      queryInterface.removeColumn("organizations", "wialon_hosting_url")
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.addColumn(
            "organizations",
            "wialon_username",
            {
              type: Sequelize.STRING
            },
            {
              transaction: t
            }
          ),
          queryInterface.addColumn(
            "organizations",
            "wialon_token",
            {
              type: Sequelize.STRING
            },
            {
              transaction: t
            }
          ),
          queryInterface.addColumn(
            "organizations",
            "wialon_hosting_url",
            {
              type: Sequelize.STRING
            },
            {
              transaction: t
            }
          )
        ]);   
    });
  }
};
