"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "letters",
          "lang",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "letters",
          "from_email",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "letters",
          "to_email",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "letters",
          "data",
          { type: Sequelize.STRING },
          {
            transaction: t
          }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("letters", "lang", { transaction:t }),
        queryInterface.removeColumn("letters", "from_email", { transaction:t }),
        queryInterface.removeColumn("letters", "to_email", { transaction:t }),
        queryInterface.removeColumn("letters", "data", { transaction:t }),

      ]);
    });
  }
};
