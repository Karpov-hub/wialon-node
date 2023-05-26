"use strict";
module.exports = (sequelize, DataTypes) => {
  const organization_aggregator_accounts = sequelize.define(
    "organization_aggregator_accounts",
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
      name: DataTypes.STRING(255),
      api_key: DataTypes.STRING(255),
      password: DataTypes.STRING(255),
      login: DataTypes.STRING(255),
      status: DataTypes.INTEGER,
      contract_number: DataTypes.STRING(255),
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
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
  organization_aggregator_accounts.associate = function(models) {
    organization_aggregator_accounts.belongsTo(models.organization, {
      foreignKey: "organization_id"
    });
    organization_aggregator_accounts.belongsTo(models.aggregator, {
      foreignKey: "aggregator_id"
    });
    organization_aggregator_accounts.hasMany(models.card, {
      foreignKey: "organization_aggregator_account_id"
    });
    // associations can be defined here
  };
  organization_aggregator_accounts.adminModelName =
    "Crm.modules.organizationAggregatorAccounts.model.OrganizationAggregatorAccountsModel";
  return organization_aggregator_accounts;
};
