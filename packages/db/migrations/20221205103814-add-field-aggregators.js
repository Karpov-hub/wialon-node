module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
        'aggregators',
        'name_for_custom_field',
        Sequelize.STRING(255),
        { transaction: t }
      ),
      queryInterface.addColumn(
        'aggregators',
        'api_key_required',
        Sequelize.BOOLEAN,
        { transaction: t }
      ),
      queryInterface.addColumn(
        'aggregators',
        'log_pas_required',
        Sequelize.BOOLEAN,
        { transaction: t }
          ),
        ])
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(
        'aggregators',
        'name_for_custom_field',
        { transaction: t }
      ),
      queryInterface.removeColumn(
        'aggregators',
        'api_key_required',
        { transaction: t }
      ),
      queryInterface.removeColumn(
        'aggregators',
        'log_pas_required',
        { transaction: t }
         ),
        ])
      }
    )
  }
}