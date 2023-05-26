'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("letters", "attachment_name", { type: Sequelize.STRING, allowNull: true }, {
                    transaction: t
                })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("letters", "attachment_name")
        ]);
    }
};