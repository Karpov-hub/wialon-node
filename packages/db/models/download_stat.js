'use strict';

module.exports = (sequelize, DataTypes) => {
  const download_stat = sequelize.define('download_stats', {
    user_id: DataTypes.UUID,
    org_id: DataTypes.UUID,
    route_id: DataTypes.UUID,
    provider_id: DataTypes.UUID,
    report_log_id: DataTypes.INTEGER,
    report_size: DataTypes.INTEGER,
    stime: DataTypes.BIGINT,
    removed: DataTypes.INTEGER,
    signobject: DataTypes.JSON,
    maker: DataTypes.UUID
  }, 
  {
    createdAt: "ctime",
    updatedAt: "mtime"    
  });
  download_stat.associate = function(models) {
    // associations can be defined here  
  };
  return download_stat;
};