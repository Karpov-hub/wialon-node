"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "download_stats", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "download_stats", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "download_stats", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "download_stats", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        }),
        queryInterface.renameColumn("download_stats", "createdAt", "ctime", {
          transaction: t
        }),
        queryInterface.renameColumn("download_stats", "updatedAt", "mtime", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("download_stats", "stime"),
      queryInterface.removeColumn("download_stats", "removed"),
      queryInterface.removeColumn("download_stats", "signobject"),
      queryInterface.removeColumn("download_stats", "maker"),
      queryInterface.renameColumn("download_stats", "mtime", "updatedAt"),
      queryInterface.renameColumn("download_stats", "ctime", "createdAt")
    ]);    
  }
};
