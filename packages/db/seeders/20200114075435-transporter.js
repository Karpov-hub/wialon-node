"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "transporters",
      [
        {
          id: "2d914c50-35d3-11ea-b4b0-d3e77cd96bd2",
          host_transporter: "smtp.gmail.com",
          port_transporter: 587,
          secure_transporter: false,
          user_transporter: "enovate170@gmail.com",
          password_transporter: "xpg@1709",
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
