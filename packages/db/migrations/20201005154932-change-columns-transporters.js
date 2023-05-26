"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
            'transporters',
            'host_transporter',
            {type: Sequelize.STRING(100)},
            {transaction: t}
        ),
        queryInterface.changeColumn(
            'transporters',
            'password_transporter',
            {type: Sequelize.STRING(100)},
            {transaction: t}
        ),
        queryInterface.changeColumn(
            'transporters',
            'user_transporter',
            {type: Sequelize.STRING(100)},
            {transaction: t}
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
        return Promise.all([
          queryInterface.changeColumn(
            'transporters',
            'host_transporter',
            {type: Sequelize.STRING(20)},
            {transaction: t}
        ),
          queryInterface.changeColumn(
              'transporters',
              'password_transporter',
              {type: Sequelize.STRING(40)},
              {transaction: t}
          ),
          queryInterface.changeColumn(
              'transporters',
              'user_transporter',
              {type: Sequelize.STRING(30)},
              {transaction: t}
          ),
        ]);
      });
  },
};
