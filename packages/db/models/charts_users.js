"use strict";
module.exports = (sequelize, DataTypes) => {
  const charts_users = sequelize.define(
    "charts_users",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      wialon_id: DataTypes.INTEGER,
      token: DataTypes.STRING,
      host: DataTypes.STRING,
      engineReportTemplate: DataTypes.STRING,
      engineReportResource: DataTypes.STRING,
      ecoReportResource: DataTypes.STRING,
      ecoReportTemplate: DataTypes.STRING,
      mailing: DataTypes.BOOLEAN,
      defaultGroup: DataTypes.INTEGER,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  charts_users.associate = function(models) {
    // associations can be defined here
  };
  return charts_users;
};
