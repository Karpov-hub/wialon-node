"use strict";

const notifications = [
  {
    _id: "a81fc96f-a0ee-4600-b5d0-2ce579016816",
    level: "error",
    search_pattern: ".",
    channels: '["telegram"]',
    delay: null,
    enabled: true,
    ctime: new Date(),
    mtime: new Date()
  },
  {
    _id: "da1a5692-2dbc-444c-8931-cf0e3280780e",
    level: "http",
    search_pattern: "Error",
    search_flags: "i",
    channels: '["telegram"]',
    delay: null,
    enabled: true,
    ctime: new Date(),
    mtime: new Date()
  },
  {
    _id: "9f1c2c38-a43a-4189-afda-0c24e6a90b43",
    search_pattern: "Failed to send alarm notification with telegram",
    channels: '["email"]',
    receivers: "dm112@tadbox.com",
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
