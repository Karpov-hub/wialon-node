"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "transporters",
      [
        {
          id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce5",
          host_transporter: "smtp.googlemail.com",
          port_transporter: 587,
          secure_transporter: false,
          user_transporter: "enovate170@gmail.com",
          password_transporter: "Passw0rd123",
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("transporters", null, {});
  }
};
