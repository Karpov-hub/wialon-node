'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("invoices", "downloads_click", { type: Sequelize.INTEGER,  defaultValue: 0 }, {
                    transaction: t
                }),
                queryInterface.addColumn("invoices", "generate_reports_click", { type: Sequelize.INTEGER,  defaultValue: 0 }, {
                  transaction: t
              })
            ]);
        });
    },
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
            queryInterface.removeColumn("invoices", "downloads_click", { transaction: t }),
            queryInterface.removeColumn("invoices", "generate_reports_click", { transaction: t })
        ]);
      });
    }
};