"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn(
          "invoices",
          "from_date",
          { type: Sequelize.DATEONLY },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "invoices",
          "to_date",
          { type: Sequelize.DATEONLY },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "invoices",
          "invoice_date",
          { type: Sequelize.DATEONLY },
          { transaction: t }
        ),
        queryInterface.removeColumn("invoices", "packages", { transaction: t })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(          
          "invoices",
          "from_date", {
          type: Sequelize.DATE,
        },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "invoices",
          "to_date", {
          type: Sequelize.DATE,
        },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "invoices",
          "invoice_date",{
          type: Sequelize.DATE,
        },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "invoices", "packages",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
      ]);
    });
  }
};
