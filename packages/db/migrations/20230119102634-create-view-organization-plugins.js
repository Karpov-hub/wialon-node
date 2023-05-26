"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW vw_organization_plugins AS SELECT 
              op.id, 
              op.plugin_id,
              p.name as plugin_name,
              op.organization_id,
              op.status,
              op.removed
            FROM organization_plugins op
            LEFT JOIN plugins p ON op.plugin_id=p.id`,
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(
        `DROP VIEW IF EXISTS vw_organization_plugins`),
    ]);
  },
};
