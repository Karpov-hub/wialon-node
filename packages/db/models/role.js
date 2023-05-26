"use strict";
module.exports = (sequelize, DataTypes) => {
  const provider = sequelize.define(
    "role",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
      },
      role: DataTypes.STRING,
      description: DataTypes.STRING,
      maker: {
        type: DataTypes.UUID,
      },
      signobject: DataTypes.JSON,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      removed: DataTypes.INTEGER,
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
    }
  );
  provider.associate = function(models) {
    // associations can be defined here
  };
  return provider;
};
