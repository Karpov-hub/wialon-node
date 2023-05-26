'use strict';
module.exports = (sequelize, DataTypes) => {
  const rates_package = sequelize.define('rates_package', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    }, 
    downloads_click: DataTypes.FLOAT,
    generate_reports_click: DataTypes.FLOAT,
    fixed_monthly_fees: DataTypes.FLOAT,
    bytes_sent: DataTypes.FLOAT,
    cpu_time_taken: DataTypes.FLOAT,
    bytes_from_wialon: DataTypes.FLOAT,
    no_of_employees: DataTypes.FLOAT,
    no_of_wialon_acc: DataTypes.FLOAT,
    is_offering_pkg: DataTypes.BOOLEAN,
    mob_cpu_time: DataTypes.FLOAT,    
    mob_bytes_sent: DataTypes.INTEGER,
    mob_bytes_from_wialon: DataTypes.INTEGER,
    mob_active_users: DataTypes.INTEGER,
    stime: DataTypes.BIGINT,
    removed: DataTypes.INTEGER,
    signobject: DataTypes.JSON,
    maker: DataTypes.UUID,
    package_name: DataTypes.STRING,
    ctime: {
      allowNull: false,
      type: DataTypes.DATE
    },
    mtime: {
      allowNull: false,
      type: DataTypes.DATE
    }
  },
  {
    createdAt: "ctime",
    updatedAt: "mtime",
    deletedAt: false
  });
  rates_package.associate = function(models) {
    // associations can be defined here
  };
  return rates_package;
};