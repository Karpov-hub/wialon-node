'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("rates_packages", "mob_cpu_time", { type: Sequelize.FLOAT, defaultValue: 0.0 }, {
                    transaction: t
                }),
                queryInterface.addColumn("rates_packages", "mob_bytes_sent", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                }),
                queryInterface.addColumn("rates_packages", "mob_bytes_from_wialon", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                }),
                queryInterface.addColumn("rates_packages", "mob_active_users", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
            queryInterface.removeColumn("rates_packages", "mob_cpu_time", { transaction: t }),
            queryInterface.removeColumn("rates_packages", "mob_bytes_sent", { transaction: t }),
            queryInterface.removeColumn("rates_packages", "mob_bytes_from_wialon", { transaction: t }),
            queryInterface.removeColumn("rates_packages", "mob_active_users", { transaction: t })
        ]);
      });
    } 
};