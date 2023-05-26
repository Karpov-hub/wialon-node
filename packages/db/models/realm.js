"use strict";
module.exports = (sequelize, DataTypes) => {
  const realm = sequelize.define(
    "realm",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      token: DataTypes.STRING,
      ip: DataTypes.STRING,
      permissions: DataTypes.JSON,
      realm: DataTypes.STRING
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  realm.associate = function(models) {
    // associations can be defined here
  };
  return realm;
};
