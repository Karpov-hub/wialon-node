"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_organization_aggregator_account_permissions = sequelize.define(
    "user_organization_aggregator_account_permissions",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: "users",
        referencesKey: "id"
      },
      organization_aggregator_account_id: {
        type: DataTypes.UUID,
        references: "organization_aggregator_accounts",
        referencesKey: "id"
      },
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: DataTypes.INTEGER,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'organization_aggregator_account_id']
        }
      ]
    }
  );

  return user_organization_aggregator_account_permissions;
};
