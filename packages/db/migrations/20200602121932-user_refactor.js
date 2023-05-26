"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([      
        queryInterface.addColumn( "users", "userlevel", 
        { type: Sequelize.INTEGER , defaultValue: 0, allowNull: false }, {
          transaction: t 
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "userlevel")
    ]);    
  }
};  
