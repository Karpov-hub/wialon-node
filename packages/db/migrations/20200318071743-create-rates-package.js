'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('rates_packages', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      package_name: {
        type: Sequelize.STRING
      },
      fixed_monthly_fees: {
        type: Sequelize.FLOAT
      },
      bytes_sent: {
        type: Sequelize.FLOAT
      },
      cpu_time_taken: {
        type: Sequelize.FLOAT
      },
      bytes_from_wialon: {
        type: Sequelize.FLOAT
      },
      no_of_employees: {
        type: Sequelize.FLOAT
      },
      no_of_wialon_acc: {
        type: Sequelize.FLOAT
      },
      is_offering_pkg: {
        type: Sequelize.BOOLEAN
      },
      stime: {
        type: Sequelize.BIGINT
      },
      removed: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('rates_packages');
  }
};