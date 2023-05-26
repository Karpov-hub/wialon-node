"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "routes", "stime", { type: Sequelize.BIGINT }, {
           transaction: t 
        }),
        queryInterface.addColumn( "routes", "signobject", { type: Sequelize.JSON }, {
          transaction: t 
        }),
        queryInterface.addColumn( "routes", "maker", { type: Sequelize.UUID }, {
          transaction: t 
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("routes", "stime"),
      queryInterface.removeColumn("routes", "signobject"),
      queryInterface.removeColumn("routes", "maker")
    ]);    
  }
};
