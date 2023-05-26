"use strict";
module.exports = (sequelize, DataTypes) => {
  const customreport = sequelize.define(
    "customreport",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      owner: DataTypes.UUID,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      code: DataTypes.TEXT,
      docker_id: DataTypes.STRING,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
    }
  );
  customreport.associate = function(models) {
    // associations can be defined here
  };
  return customreport;
};
