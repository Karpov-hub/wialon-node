'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("routes", "report_id", { type: Sequelize.UUID, allowNull: true }, {
                    transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("routes", "report_id")
        ]);
    }
};