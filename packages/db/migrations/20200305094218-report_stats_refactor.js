"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "report_stats", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "report_stats", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "report_stats", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "report_stats", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        }),
        queryInterface.renameColumn("report_stats", "createdAt", "ctime", {
          transaction: t
        }),
        queryInterface.renameColumn("report_stats", "updatedAt", "mtime", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("report_stats", "stime"),
      queryInterface.removeColumn("report_stats", "removed"),
      queryInterface.removeColumn("report_stats", "signobject"),
      queryInterface.removeColumn("report_stats", "maker"),
      queryInterface.renameColumn("report_stats", "mtime", "updatedAt"),
      queryInterface.renameColumn("report_stats", "ctime", "createdAt")
    ]);    
  }
};
