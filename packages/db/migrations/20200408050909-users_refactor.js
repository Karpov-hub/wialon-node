"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkUpdate('users', { is_active: false }, { is_active: null }, { transaction: t }),
        queryInterface.changeColumn("users", "is_active", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }, { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkUpdate('users', { is_active: null }, { is_active: false }, { transaction: t }),
        queryInterface.changeColumn('users', 'is_active', {
          type: Sequelize.BOOLEAN,
        },
          { transaction: t }
        ),
      ]);
    });
  },
};
