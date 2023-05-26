'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('mobile_usage_stats', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      organization_id: {
        type: Sequelize.UUID       
      },
      user_id: {
        type: Sequelize.UUID       
      },
      method_name: {
        type: Sequelize.STRING        
      },
      cpu_time: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      bytes_sent: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bytes_from_wialon: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    return queryInterface.dropTable('mobile_usage_stats');
  }
};