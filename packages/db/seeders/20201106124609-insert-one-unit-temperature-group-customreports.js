'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "8cdb489b-ff27-4d91-b91e-586587bafe41",
          name: "One Unit Temperature Report",
          description: "One Unit Temperature Report",
          ctime: new Date(),
          mtime: new Date(),
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("customreports", null, {});
  }
};
