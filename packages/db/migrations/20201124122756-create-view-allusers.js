"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `create view vw_allusers as select id, name, email as login, 1 as type from users union select _id as id, name, login, 2 as type from admin_users`,
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(
        `drop view if exists vw_allusers`), 
    ]);
  },
};
