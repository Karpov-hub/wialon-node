"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "providers", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "providers", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "providers", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("providers", "stime"),
      queryInterface.removeColumn("providers", "signobject"),
      queryInterface.removeColumn("providers", "maker")     
    ]);    
  }
}; 
