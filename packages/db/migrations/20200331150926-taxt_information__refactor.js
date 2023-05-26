"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([        
        queryInterface.changeColumn( "tax_informations", "from_date", { type: Sequelize.DATEONLY }, { transaction: t }),
        queryInterface.changeColumn( "tax_informations", "to_date", { type: Sequelize.DATEONLY }, { transaction: t }),
      ]);
    });
  },
 
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn("tax_informations", "from_date", {
          type: Sequelize.DATE,
        },
          { transaction: t }
        ),
        queryInterface.changeColumn("tax_informations", "to_date", {
          type: Sequelize.DATE,
        },
          { transaction: t }
        ),
      ]);
    });
  }
};
