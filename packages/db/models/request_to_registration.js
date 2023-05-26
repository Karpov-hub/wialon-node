"use strict";
module.exports = (sequelize, DataTypes) => {
  const request_to_registration = sequelize.define(
    "request_to_registration",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: DataTypes.STRING(255),
      company: DataTypes.STRING(255),
      website: DataTypes.STRING(255),
      is_wialon_accounts_exists: DataTypes.BOOLEAN,
      wishes: DataTypes.TEXT,
      phone_number: DataTypes.STRING(20),
      email: DataTypes.STRING(256),
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      realm_id: DataTypes.UUID,
      lang: {
        type: DataTypes.STRING(2),
        defaultValue: "en"
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true
    }
  );
  request_to_registration.associate = function(models) {
    // associations can be defined here
  };
  return request_to_registration;
};
