"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        "registation_for_presentation",
        "is_order_make_or_self"
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "registation_for_presentation",
        "is_order_make_or_self",
        {
          type: Sequelize.INTEGER
        }
      ),
    ]);
  },
};
