'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("report_stats", "wialon_error_code", { type: Sequelize.INTEGER, allowNull: true }, {
                    transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("report_stats", "wialon_error_code")
        ]);
    }
};