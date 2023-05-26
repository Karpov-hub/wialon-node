"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async t => {
      const [
        organizations
      ] = await queryInterface.sequelize.query(
        'SELECT * FROM public."organizations";',
        { t }
      );
      let defaultPkg = await queryInterface.sequelize.query(
        `SELECT * FROM public."rates_packages" where package_name='Default_Package';`,
        { t }
      );

      if (organizations.length > 0) {
        // prepare data
        let package_subscription = [];
        for (let i = 0; i < organizations.length; i++) {
          let rowCount = await queryInterface.sequelize.query(
            `SELECT COUNT(*) FROM public."package_subscriptions" where organization_id='${organizations[i].id}';`,
            { t }
          );
          if (rowCount[0][0].count < 1) {
            package_subscription.push({
              id: organizations[i].id,
              organization_id: organizations[i].id,
              rates_package_id: defaultPkg[0][0].id,
              from_date: organizations[i].ctime,
              ctime: new Date(),
              mtime: new Date()
            });
          }
        }
        await queryInterface.bulkInsert(
          "package_subscriptions",
          package_subscription,
          { t }
        );
      }
      return true;
    }),

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {});
  }
};
