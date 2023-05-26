'use strict';
module.exports = (sequelize, DataTypes) => {
  const mobile_usage_stat = sequelize.define('mobile_usage_stat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    organization_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    method_name: DataTypes.STRING,
    cpu_time: DataTypes.FLOAT,
    bytes_sent: DataTypes.INTEGER,
    bytes_from_wialon: DataTypes.INTEGER,
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
  mobile_usage_stat.associate = function (models) {
    // associations can be defined here
  };
  return mobile_usage_stat;
}; 