"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "realms",
      [
        {
          id: "2b4c01ca-2749-11eb-adc1-0242ac120002",
          name: "charts",
          token: "7efc865a-2749-11eb-adc1-0242ac120002",
          ip: "0.0.0.0",
          permissions: JSON.stringify({
            "charts-service": {
              send: true
            }
          }),

          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    // return queryInterface.bulkDelete("letters", null, {});
    return queryInterface.bulkDelete("realms", null, {});
  }
};
