'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('download_stats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      org_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      route_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      provider_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      report_log_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      }, 
      report_size: {
        allowNull: false,
        type: Sequelize.INTEGER
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('download_stats');
  }
};