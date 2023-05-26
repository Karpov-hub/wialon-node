"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "transporters",
      [
        {
          id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce6",
          host_transporter: "smtp.gmail.com",
          port_transporter: 587,
          secure_transporter: true,
          user_transporter: "wialon.charts@gmail.com",
          password_transporter: "REv7b2jBQV2x",
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
