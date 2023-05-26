'use strict';
module.exports = (sequelize, DataTypes) => {
  const invoice = sequelize.define('invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true 
    }, 
    total_fees: DataTypes.FLOAT,
    plugins_fees_amount: DataTypes.FLOAT,
    plugins_fees: DataTypes.JSON,
    from_date: DataTypes.DATEONLY,
    to_date: DataTypes.DATEONLY,
    invoice_date: DataTypes.DATEONLY,
    bytes_sent: DataTypes.BIGINT,
    cpu_time_taken: DataTypes.FLOAT,
    bytes_from_wialon: DataTypes.BIGINT,
    no_of_employees: DataTypes.INTEGER,
    no_of_wialon_acc: DataTypes.INTEGER,
    downloads_click: DataTypes.INTEGER,
    mob_cpu_time: DataTypes.FLOAT,    
    mob_bytes_sent: DataTypes.INTEGER,
    mob_bytes_from_wialon: DataTypes.INTEGER,
    mob_active_users: DataTypes.INTEGER,
    tax_id: DataTypes.UUID,
    adjustment: DataTypes.INTEGER,
    organization_id: DataTypes.UUID,
    stime: DataTypes.BIGINT,
    removed: DataTypes.INTEGER,
    signobject: DataTypes.JSON,
    maker: DataTypes.UUID,
    ctime: {
      allowNull: false,
      type: DataTypes.DATE
    }, 
    mtime: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    createdAt: "ctime",
    updatedAt: "mtime",
    deletedAt: false
  });
  invoice.associate = function(models) {
    // associations can be defined here
  };
  return invoice;
};