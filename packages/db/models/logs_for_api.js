"use strict";
module.exports = (sequelize, DataTypes) => {
  const logs_for_api = sequelize.define(
    "logs_for_api",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      action: DataTypes.STRING(100),
      user_id: DataTypes.UUID,
      message: DataTypes.TEXT,
      data: DataTypes.TEXT,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: DataTypes.INTEGER,
      maker: DataTypes.UUID
    },
    {
      id: "id",
      freezeTableName: true,
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  logs_for_api.associate = function(models) {
    logs_for_api.belongsTo(models.user, {
      foreignKey: "user_id",
    });
    // associations can be defined here
  };
  return logs_for_api;
};
