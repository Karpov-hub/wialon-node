module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "aggregators",
          "contract_number_required",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
            "organizationaggregators",
            "contract_number",
            {
              type: Sequelize.STRING(255),
              defaultValue: null,
              allowNull: true
            },
            { transaction: t }
          ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("aggregators", "contract_number_required", {
          transaction: t
        }),
        queryInterface.removeColumn("organizationaggregators", "contract_number", {
          transaction: t
        })
      ]);
    });
  }
};
