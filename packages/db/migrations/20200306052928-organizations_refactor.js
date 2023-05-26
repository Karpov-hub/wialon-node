"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "organizations", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "organizations", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "organizations", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("organizations", "stime"),
      queryInterface.removeColumn("organizations", "signobject"),
      queryInterface.removeColumn("organizations", "maker"),
    ]);    
  }
}; 
