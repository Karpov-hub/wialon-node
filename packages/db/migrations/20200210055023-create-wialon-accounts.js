'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable('wialon_accounts', {
          id: {
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          wialon_username: {
            type: Sequelize.STRING
          },
          wialon_token: {
            type: Sequelize.STRING
          },
          wialon_hosting_url: {
            type: Sequelize.STRING
          },
          organization_id: {
            type: Sequelize.UUID,
            references: {
              model: 'organizations',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        }, { t });
        
        const [organizations] = await queryInterface.sequelize.query('SELECT * FROM public."organizations";', { t });       

        if(organizations.length > 0) {
           // prepare data
          const wialon_accounts = organizations.map(({ id, wialon_username, wialon_token, wialon_hosting_url, ctime, mtime }) => ({
              organization_id: id,
              wialon_username,
              wialon_token,
              wialon_hosting_url,
              createdAt: ctime,
              updatedAt: mtime
          }));

          await queryInterface.bulkInsert('wialon_accounts', wialon_accounts, { t });
        }

        return true;  
  }),
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('wialon_accounts');
  }
};