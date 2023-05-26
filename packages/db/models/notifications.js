"use strict";
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define(
    "notification",
    {
      _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      level: DataTypes.STRING(64),
      search_pattern: DataTypes.STRING(4096),
      search_flags: DataTypes.STRING(8),
      channels: DataTypes.JSONB,
      receivers: DataTypes.STRING(4096),
      delay: DataTypes.BIGINT,
      enabled: DataTypes.BOOLEAN,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      id: "_id",
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  return notification;
};
