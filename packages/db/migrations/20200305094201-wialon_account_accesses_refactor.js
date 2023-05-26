"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "wialon_account_accesses", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "wialon_account_accesses", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "wialon_account_accesses", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "wialon_account_accesses", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        }),
        queryInterface.renameColumn("wialon_account_accesses", "createdAt", "ctime", {
          transaction: t
        }),
        queryInterface.renameColumn("wialon_account_accesses", "updatedAt", "mtime", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("wialon_account_accesses", "stime"),
      queryInterface.removeColumn("wialon_account_accesses", "removed"),
      queryInterface.removeColumn("wialon_account_accesses", "signobject"),
      queryInterface.removeColumn("wialon_account_accesses", "maker"),
      queryInterface.renameColumn("wialon_account_accesses", "mtime", "updatedAt"),
      queryInterface.renameColumn("wialon_account_accesses", "ctime", "createdAt")
    ]);    
  }
};
