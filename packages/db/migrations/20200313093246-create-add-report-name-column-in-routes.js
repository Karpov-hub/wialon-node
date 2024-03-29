'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn( "routes", "report_name", { type: Sequelize.STRING }, {
           transaction: t 
        })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("routes", "report_name")
    ]);    
  }
};