"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([     
        queryInterface.bulkUpdate('Permissions', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('wialon_account_accesses', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('wialon_accounts', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('download_stats', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('report_stats', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('routes', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('organizations', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('providers', {removed:0}, {removed: null}, { transaction: t }),
        queryInterface.bulkUpdate('users', {removed:0}, {removed: null}, { transaction: t }),

        queryInterface.changeColumn( "Permissions", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "wialon_account_accesses", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "wialon_accounts", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "download_stats", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "report_stats", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "routes", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "organizations", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "providers", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "users", "removed", { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 }, { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkUpdate('Permissions', {removed: null}, {removed:0}, { transaction: t }),
        queryInterface.bulkUpdate('wialon_account_accesses', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('wialon_accounts', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('download_stats', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('report_stats', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('routes', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('organizations', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('providers', {removed: null}, {removed:0},{ transaction: t }),
        queryInterface.bulkUpdate('users', {removed: null}, {removed:0},{ transaction: t }),

        queryInterface.changeColumn( "Permissions", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "wialon_account_accesses", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "wialon_accounts", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "download_stats", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "report_stats", "removed",{ type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "routes", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.changeColumn( "organizations", "removed", { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction: t }),
        queryInterface.changeColumn( "providers", "removed", { type: Sequelize.INTEGER, defaultValue: 0  }, { transaction: t }),
        queryInterface.changeColumn( "users", "removed", { type: Sequelize.INTEGER }, { transaction: t }),
      ]);
    });
  }
}; 
