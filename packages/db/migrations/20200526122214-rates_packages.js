'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("rates_packages", "downloads_click", { type: Sequelize.FLOAT,  defaultValue: 0 }, {
                    transaction: t
                }),
                queryInterface.addColumn("rates_packages", "generate_reports_click", { type: Sequelize.FLOAT,  defaultValue: 0 }, {
                  transaction: t
              })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
            queryInterface.removeColumn("rates_packages", "downloads_click", { transaction: t }),
            queryInterface.removeColumn("rates_packages", "generate_reports_click", { transaction: t })
        ]);
      });
    }
};