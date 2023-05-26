"use strict";
module.exports = (sequelize, DataTypes) => {
  const charts_mailings = sequelize.define(
    "charts_mailings",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      user_id: DataTypes.INTEGER,
      email: DataTypes.STRING,
      hour: DataTypes.INTEGER, // From 1 to 24 by GMT 00:00
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  charts_mailings.associate = function(models) {
    // associations can be defined here
  };
  return charts_mailings;
};
