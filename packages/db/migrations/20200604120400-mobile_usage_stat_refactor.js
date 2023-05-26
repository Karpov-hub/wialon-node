'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("mobile_usage_stats", "wialon_acc_id", { type: Sequelize.INTEGER, allowNull: true }, {
                    transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("mobile_usage_stats", "wialon_acc_id")
        ]);
    }
};