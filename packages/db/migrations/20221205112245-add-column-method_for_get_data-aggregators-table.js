module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn(
        'aggregators',
        'method_for_get_data',
        Sequelize.STRING(255)
      );
  
    },
  
    down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn(
        'aggregators',
        'method_for_get_data'
      );
    }
  }