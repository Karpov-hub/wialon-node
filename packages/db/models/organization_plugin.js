"use strict";
module.exports = (sequelize, DataTypes) => {
  const organization_plugin = sequelize.define(
    "organization_plugin",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      organization_id: {
        type: DataTypes.UUID,
        references: "organizations",
        referencesKey: "id"
      },
      plugin_id: {
        type: DataTypes.UUID,
        references: "plugins",
        referencesKey: "id"
      },
      status: DataTypes.INTEGER,
      is_cron_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      reject_reason: {
        type: DataTypes.TEXT,
        defaultValue: null
      },
      last_activated_date: DataTypes.DATE,
      last_deactivated_date: DataTypes.DATE,
      plugin_fees: DataTypes.FLOAT,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  organization_plugin.associate = function (models) {
    organization_plugin.belongsTo(models.organization, {
      foreignKey: "organization_id",
      targetKey: "id"
    });
    organization_plugin.belongsTo(models.plugin, {
      foreignKey: "plugin_id",
      targetKey: "id"
    });
  };
  return organization_plugin;
};