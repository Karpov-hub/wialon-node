"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "Permissions", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "Permissions", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "Permissions", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "Permissions", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        }),
        queryInterface.renameColumn("Permissions", "createdAt", "ctime", {
          transaction: t
        }),
        queryInterface.renameColumn("Permissions", "updatedAt", "mtime", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Permissions", "stime"),
      queryInterface.removeColumn("Permissions", "removed"),
      queryInterface.removeColumn("Permissions", "signobject"),
      queryInterface.removeColumn("Permissions", "maker"),
      queryInterface.renameColumn("Permissions", "mtime", "updatedAt"),
      queryInterface.renameColumn("Permissions", "ctime", "createdAt")
    ]);    
  }
};
