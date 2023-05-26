"use strict";
module.exports = (sequelize, DataTypes) => {
  const admin_logs = sequelize.define(
    "admin_logs",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      data: DataTypes.JSON,
      result: DataTypes.JSON,
      date: DataTypes.DATE,
      admin_id: DataTypes.UUID
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );

  return admin_logs;
};
