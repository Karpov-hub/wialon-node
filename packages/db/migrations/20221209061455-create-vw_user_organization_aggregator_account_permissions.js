"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE VIEW vw_user_organization_aggregator_account_permissions 
      AS SELECT uoaap.id, uoaap.user_id, org.id as organization_id, ag.id as aggregator_id, uoaap.ctime, uoaap.mtime, uoaap.maker, uoaap.signobject, uoaap.removed
      FROM user_organization_aggregator_account_permissions uoaap, organization_aggregator_accounts oaa, organizations org, aggregators ag
      WHERE oaa.id = uoaap.organization_aggregator_account_id
      AND org.id = oaa.organization_id
      AND ag.id = oaa.aggregator_id`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW vw_user_organization_aggregator_account_permissions`);
  }
};
