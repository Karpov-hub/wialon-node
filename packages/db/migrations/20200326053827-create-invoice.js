'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('invoices', {      
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      adjustment: {
        type: Sequelize.INTEGER
      },
      total_fees: {
        type: Sequelize.FLOAT
      },      
      from_date: {
        type: Sequelize.DATE
      },
      to_date: {
        type: Sequelize.DATE
      },
      invoice_date: {
        type: Sequelize.DATE
      },
      bytes_sent: {
        type: Sequelize.BIGINT
      },
      cpu_time_taken: {
        type: Sequelize.FLOAT
      },
      bytes_from_wialon: {
        type: Sequelize.BIGINT
      },
      no_of_employees: {
        type: Sequelize.INTEGER
      },
      no_of_wialon_acc: {
        type: Sequelize.INTEGER
      },
      tax_id: {
        type: Sequelize.UUID
      },
      organization_id: {
        type: Sequelize.UUID
      },
      stime: {
        type: Sequelize.BIGINT
      },
      removed: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      packages: {
        type: Sequelize.JSON
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
    return queryInterface.dropTable('invoices');
  }
};