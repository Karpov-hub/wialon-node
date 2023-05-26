'use strict';
module.exports = (sequelize, DataTypes) => {
  const tax_information = sequelize.define('tax_information', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },    
    percentage: DataTypes.FLOAT,
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
  }, {
    createdAt: "ctime",
    updatedAt: "mtime",
    deletedAt: false
  });
  tax_information.associate = function(models) {
    // associations can be defined here
  };
  return tax_information;
};