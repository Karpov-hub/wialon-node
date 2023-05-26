"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "organizations",
          "is_billing_enabled",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "organizations",
          "is_report_template_generator_enabled",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("organizations", "is_billing_enabled", {
          transaction: t
        }),
        queryInterface.removeColumn(
          "organizations",
          "is_report_template_generator_enabled",
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
