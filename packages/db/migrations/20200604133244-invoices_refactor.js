'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("invoices", "mob_cpu_time", { type: Sequelize.FLOAT, defaultValue: 0.0 }, {
                    transaction: t
                }),
                queryInterface.addColumn("invoices", "mob_bytes_sent", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                }),
                queryInterface.addColumn("invoices", "mob_bytes_from_wialon", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                }),
                queryInterface.addColumn("invoices", "mob_active_users", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                  transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
            queryInterface.removeColumn("invoices", "mob_cpu_time", { transaction: t }),
            queryInterface.removeColumn("invoices", "mob_bytes_sent", { transaction: t }),
            queryInterface.removeColumn("invoices", "mob_bytes_from_wialon", { transaction: t }),
            queryInterface.removeColumn("invoices", "mob_active_users", { transaction: t })
        ]);
      });
    } 
};