"use strict";
module.exports = (sequelize, DataTypes) => {
  const route = sequelize.define(
    "route",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      method: DataTypes.STRING,
      report_id: DataTypes.UUID,
      report_name: DataTypes.STRING,
      service: DataTypes.STRING,
      description: DataTypes.STRING,
      organization_id: DataTypes.UUID,
      type: DataTypes.INTEGER,
      requirements: DataTypes.STRING,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      removed: DataTypes.INTEGER,
      original_requirements: DataTypes.STRING(1000),
      maker: DataTypes.UUID,
      jasper_report_code: {
        allowNull: true,
        type: DataTypes.STRING(255)
      },
      formats: {
        allowNull: true,
        type: DataTypes.JSON
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  route.associate = function(models) {
    route.hasMany(models.report_label, {
      targetKey: "id",
      foreignKey: "report_id"
    });

    route.hasMany(models.references_report, {
      targetKey: "id",
      foreignKey: "route_id"
    });

    route.hasMany(models.Permissions, {
      targetKey: "permissions",
      foreignKey: "route_id"
    });
  };
  return route;
};
