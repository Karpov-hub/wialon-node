"use strict";
module.exports = (sequelize, DataTypes) => {
  const organization = sequelize.define(
    "organization",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      organization_name: DataTypes.STRING,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: DataTypes.INTEGER,
      billing_day: DataTypes.INTEGER,
      stime: DataTypes.BIGINT,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      is_billing_enabled: {
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      is_report_template_generator_enabled: {
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      sandbox_access_status: {
        defaultValue: 1,
        type: DataTypes.INTEGER
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  organization.associate = function(models) {
    organization.hasMany(models.user, {
      targetKey: "id",
      foreignKey: "organization_id"
    });
    // associations can be defined here
  };
  return organization;
};
