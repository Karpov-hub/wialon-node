'use strict';
module.exports = (sequelize, DataTypes) => {
  const usage_report = sequelize.define('usage_report', {
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    organization_id: DataTypes.UUID,
    date: DataTypes.DATE,
    bytes_from_wialon: DataTypes.BIGINT,
    bytes_sent: DataTypes.BIGINT,
    cpu_time_taken: DataTypes.BIGINT,
    downloads_click: DataTypes.INTEGER,
    generate_reports_click: DataTypes.INTEGER,
    mob_cpu_time: DataTypes.FLOAT,
    mob_bytes_sent: DataTypes.INTEGER,
    mob_bytes_from_wialon: DataTypes.INTEGER,
    rates_package_id: DataTypes.UUID,
  }, {});
  usage_report.associate = function(models) {
    // associations can be defined here
  };
  return usage_report;
};
