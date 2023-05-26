"use strict";
module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define(
    "Permissions",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      route_id: DataTypes.UUID,
      role_id: DataTypes.UUID,
      organization_id: DataTypes.UUID,
      is_permissible: DataTypes.BOOLEAN,
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime"
    }
  );
  Permissions.associate = function(models) {
    Permissions.belongsTo(models.role, {
      targetKey: "id",
      foreignKey: "role_id"
    });
    // associations can be defined here
  };
  return Permissions;
};
