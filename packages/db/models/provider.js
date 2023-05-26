"use strict";
module.exports = (sequelize, DataTypes) => {
  const provider = sequelize.define(
    "provider",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      code: DataTypes.UUID,
      filename: DataTypes.STRING,
      file_size: DataTypes.INTEGER,
      mime_type: DataTypes.STRING,
      upload_date: DataTypes.DATE,
      storage_date: DataTypes.DATE,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  provider.associate = function(models) {
    // associations can be defined here
  };
  return provider;
};
