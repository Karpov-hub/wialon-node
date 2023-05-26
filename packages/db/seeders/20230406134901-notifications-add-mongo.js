"use strict";

const notifications = [
  {
    _id: "e9be1704-2aa7-4465-960e-1cb16d443e71",
    search_pattern: "Log Mongo error",
    channels: '["telegram", "email"]',
    search_flags: "gi",
    receivers: "dm112@tadbox.com,id102@tadbox.com",
    delay: null,
    enabled: true,
    ctime: new Date(),
    mtime: new Date()
  }
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("notifications", notifications, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "notifications",
      {
        _id: {
          [Sequelize.Op.in]: notifications.map((n) => n._id)
        }
      },
      {}
    );
  }
};
