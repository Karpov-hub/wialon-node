"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "tax_informations",
      [
        {
          id: "1cfb3d6d-80d3-4af8-a63b-2650d13b565a",
          percentage : 11.60,
          from_date: '2018-04-01 00:00:00',
          to_date: '2019-03-31 00:00:00',
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
          percentage : 11.60,
          from_date: '2019-04-01 00:00:00',
          to_date: '2020-03-31 00:00:00',
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: "9fb97875-ea3a-4008-ae57-54c8982e6788",
          percentage : 11.50,
          from_date: '2020-04-01 00:00:00',
          to_date: '2021-03-31 00:00:00',
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("tax_informations", null, {});
  }
};
