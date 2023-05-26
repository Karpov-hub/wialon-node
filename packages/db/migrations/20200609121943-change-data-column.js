"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.allSettled([
        queryInterface.removeColumn("letters", "data", {
          transaction: t
        }),
        ,
        queryInterface.sequelize.query(`alter table letters add data text`, {
          transaction: t
        })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([]);
  }
};
