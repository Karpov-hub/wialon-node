"use strict";

module.exports = (sequelize, DataTypes) => {
  const wialon_accounts = sequelize.define(
    "wialon_accounts",
    {
      organization_id: DataTypes.UUID,
      wialon_username: DataTypes.STRING,
      wialon_token: DataTypes.STRING,
      wialon_hosting_url: DataTypes.STRING,
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime"
    }
  );
  wialon_accounts.associate = function(models) {
    // associations can be defined here
  };
  return wialon_accounts;
};
