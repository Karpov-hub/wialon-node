"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "wialon_accounts", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "wialon_accounts", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "wialon_accounts", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "wialon_accounts", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        }),
        queryInterface.renameColumn("wialon_accounts", "createdAt", "ctime", {
          transaction: t
        }),
        queryInterface.renameColumn("wialon_accounts", "updatedAt", "mtime", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("wialon_accounts", "stime"),
      queryInterface.removeColumn("wialon_accounts", "removed"),
      queryInterface.removeColumn("wialon_accounts", "signobject"),
      queryInterface.removeColumn("wialon_accounts", "maker"),
      queryInterface.renameColumn("wialon_accounts", "mtime", "updatedAt"),
      queryInterface.renameColumn("wialon_accounts", "ctime", "createdAt")
    ]);    
  }
};
