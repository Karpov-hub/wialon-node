"use strict";
module.exports = (sequelize, DataTypes) => {
  const organization_aggregator_account_permissions = sequelize.define(
    "organization_aggregator_account_permissions",
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
      aggregator_id: {
        type: DataTypes.UUID,
        references: "aggregators",
        referencesKey: "id"
      },
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true
    }
  );

  organization_aggregator_account_permissions.associate = function (models) {
    organization_aggregator_account_permissions.belongsTo(models.organization, {
      foreignKey: "organization_id"
    });
    organization_aggregator_account_permissions.belongsTo(models.aggregator, {
      foreignKey: "aggregator_id"
    });
    // associations can be defined here
  };

  organization_aggregator_account_permissions.adminModelName = "Crm.modules.organizationAggregatorAccounts.model.OrganizationAggregatorAccountPermissionsModel";
  return organization_aggregator_account_permissions;
};
