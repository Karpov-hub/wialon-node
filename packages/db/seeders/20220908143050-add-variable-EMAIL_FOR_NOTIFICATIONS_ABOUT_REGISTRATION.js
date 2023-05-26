'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "system_variables",
      [
        {
          id: "0407353b-c5d2-4916-bf5c-d78cd0b3e13d",
          code: "EMAIL_FOR_NOTIFICATIONS_ABOUT_REGISTRATION",
          value: 'repogen@getgps.eu',
          ctime: new Date(),
          mtime: new Date(),
          maker: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4",
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("system_variables", null, {});
  }
};