"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.changeColumn("organizationaggregators", "login", {
                type: Sequelize.STRING(255),
                allowNull: true
                }, { transaction: t }),
                queryInterface.changeColumn("organizationaggregators", "password", {
                    type: Sequelize.STRING(255),
                    allowNull: true
                }, { transaction: t }),
                queryInterface.changeColumn("organizationaggregators", "api_key", {
                    type: Sequelize.STRING(255),
                    allowNull: true
                }, { transaction: t }),
            ])
        })
    },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
        return Promise.all([
            queryInterface.changeColumn("organizationaggregators", "login", {
            type: Sequelize.STRING(255),
            allowNull: false
            }, { transaction: t }),
            queryInterface.changeColumn("organizationaggregators", "password", {
                type: Sequelize.STRING(255),
                allowNull: false
            }, { transaction: t }),
            queryInterface.changeColumn("organizationaggregators", "api_key", {
                type: Sequelize.STRING(255),
                allowNull: false
            }, { transaction: t }),
        ])
    })
  }
};
