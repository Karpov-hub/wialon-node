'use strict';
module.exports = (sequelize, DataTypes) => {
  const custom_report_request = sequelize.define('custom_report_request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    }, 
    user_id: DataTypes.UUID,
    user_email: DataTypes.STRING,
    organization_id: DataTypes.UUID,
    attachment_name: DataTypes.STRING,
    html: DataTypes.TEXT,
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
  custom_report_request.associate = function(models) {
    // associations can be defined here
  };
  return custom_report_request;
}; 