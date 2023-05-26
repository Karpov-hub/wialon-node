"use strict";
module.exports = (sequelize, DataTypes) => {
  const aggregator = sequelize.define(
    "aggregator",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: DataTypes.STRING(255),
      api_key_required: DataTypes.BOOLEAN,
      log_pas_required: DataTypes.BOOLEAN,
      contract_number_required: DataTypes.BOOLEAN,
      name_for_custom_field: DataTypes.STRING(255),
      host: DataTypes.STRING(255),
      method_for_check: DataTypes.STRING(255),
      method_for_get_data: DataTypes.STRING(255),
      service_for_method: DataTypes.STRING(255),
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  aggregator.associate = function (models) {
    aggregator.hasMany(models.organization_aggregator_accounts, {
      foreignKey: "aggregator_id"
    });
    // associations can be defined here
  };
  aggregator.adminModelName = "Crm.modules.aggregators.model.AggregatorsModel";
  return aggregator;
};
