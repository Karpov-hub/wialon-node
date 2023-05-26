"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING(100),
      email: DataTypes.STRING(100),
      pass: DataTypes.STRING(128),
      salt: DataTypes.STRING(128),
      organization_id: DataTypes.UUID,
      role_id: DataTypes.UUID,
      realm: DataTypes.UUID,
      is_active: DataTypes.BOOLEAN,
      wialon_token: DataTypes.STRING,
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      userlevel: DataTypes.INTEGER,
      custom_report_access: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      is_blocked_by_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      preferred_language: {
        type: DataTypes.STRING(3),
        defaultValue: "EN",
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  user.associate = function(models) {
    user.belongsTo(models.organization, {
      foreignKey: "organization_id",
      targetKey: "id"
    });
    // associations can be defined here
  };
  return user;
};
