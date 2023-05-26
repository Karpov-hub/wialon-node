'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("users", "custom_report_access", { type: Sequelize.INTEGER, defaultValue: 0 }, {
                    transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("users", "custom_report_access")
        ]);
    }
};