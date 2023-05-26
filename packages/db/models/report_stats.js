'use strict';
module.exports = (sequelize, DataTypes) => {
  const report_stats = sequelize.define('report_stats', {
    organization_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    route_id: DataTypes.UUID,
    provider_id: DataTypes.UUID,
    report_generation_time: DataTypes.FLOAT,
    report_size: DataTypes.INTEGER,
    wialon_error_code: DataTypes.INTEGER,
    error_message: DataTypes.STRING,
    report_params: DataTypes.STRING,
    status: DataTypes.INTEGER,
    stime: DataTypes.BIGINT,
    removed: DataTypes.INTEGER,
    signobject: DataTypes.JSON,
    maker: DataTypes.UUID
  }, 
  {
    createdAt: "ctime",
    updatedAt: "mtime"    
  });
  report_stats.associate = function (models) {
    // associations can be defined here
  };
  return report_stats;
}; 