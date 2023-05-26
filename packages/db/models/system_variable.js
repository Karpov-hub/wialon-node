"use strict";
module.exports = (sequelize, DataTypes) => {
  const system_variable = sequelize.define(
    "system_variable",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(256),
        allowNull: false
      },
      value: {
          type: DataTypes.STRING(1000),
          allowNull: false
      },
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      realm_id: DataTypes.UUID
    },
    {
      id: "id",
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  system_variable.associate = function(models) {
    // associations can be defined here
  };
  return system_variable;
};
