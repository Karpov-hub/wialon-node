'use strict';
module.exports = (sequelize, DataTypes) => {
  const wialon_account_access = sequelize.define('wialon_account_accesses', {    
    user_id: DataTypes.UUID,
    wialon_acc_id: DataTypes.INTEGER,
    stime: DataTypes.BIGINT,
    removed: DataTypes.INTEGER,
    signobject: DataTypes.JSON,
    maker: DataTypes.UUID
  },
  {
    createdAt: "ctime",
    updatedAt: "mtime"    
  });
  wialon_account_access.associate = function(models) {
    // associations can be defined here
  };
  return wialon_account_access;
};