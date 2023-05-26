"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([     
        queryInterface.bulkUpdate('users', {userlevel:2}, {userlevel: 0}, { transaction: t }),
      ]);
    }); 
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkUpdate('users', {userlevel: 0}, {userlevel:2}, { transaction: t }),
      ]);
    });
  } 
}; 
