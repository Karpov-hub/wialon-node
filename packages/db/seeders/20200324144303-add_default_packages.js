"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "rates_packages",
      [
        {
          id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
          package_name : "Default_Package",
          fixed_monthly_fees : 50.0,
          bytes_sent : 0.05,
          cpu_time_taken : 0.025,
          bytes_from_wialon : 0.12,
          no_of_employees : 2.0,
          no_of_wialon_acc : 1.0,
          is_offering_pkg : false,
          downloads_click: 0.12,
          generate_reports_click: 0.5,
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("rates_packages", null, {});
  }
};
