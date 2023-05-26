"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "vw_organization_plugins",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      plugin_id: DataTypes.UUID,
      plugin_name: DataTypes.STRING,
      organization_id: DataTypes.UUID,
      status: DataTypes.INTEGER,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
    }
  );
};
