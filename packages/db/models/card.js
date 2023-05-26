"use strict";
module.exports = (sequelize, DataTypes) => {
  const card = sequelize.define(
    "card",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      card_number: DataTypes.STRING(100),
      organization_id: DataTypes.UUID,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      unit_id: DataTypes.BIGINT,
      organization_aggregator_account_id: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  card.associate = function(models) {
    card.belongsTo(models.organization_aggregator_accounts, {
      foreignKey: "organization_aggregator_account_id"
    });

    // associations can be defined here
  };
  card.adminModelName = "Crm.modules.cards.model.CardsModel";
  return card;
};
