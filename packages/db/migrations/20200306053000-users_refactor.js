"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "users", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "users", "removed", { type: Sequelize.INTEGER }, {
          transaction: t 
        }),
        queryInterface.addColumn( "users", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "users", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "stime"),
      queryInterface.removeColumn("users", "removed"),
      queryInterface.removeColumn("users", "signobject"),
      queryInterface.removeColumn("users", "maker")   
    ]);    
  }
}; 
