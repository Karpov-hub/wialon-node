'use strict';
module.exports = (sequelize, DataTypes) => {
  const package_subscription = sequelize.define('package_subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    }, 
    organization_id: DataTypes.UUID,
    rates_package_id: DataTypes.UUID,
    from_date: DataTypes.DATEONLY,
    to_date: DataTypes.DATEONLY,
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
  },
  {
    createdAt: "ctime",
    updatedAt: "mtime",
    deletedAt: false
  });  
  package_subscription.associate = function(models) {
    // associations can be defined here
  };
  return package_subscription;
};