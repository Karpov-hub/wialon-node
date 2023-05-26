"use strict";
module.exports = (sequelize, DataTypes) => {
  const references_report = sequelize.define(
    "references_report",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true
      },
      route_id: DataTypes.UUID,
      description: DataTypes.TEXT,
      file_id: DataTypes.JSON,
      file_name: DataTypes.JSON,
      file_size: DataTypes.JSON,
      realm_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: DataTypes.INTEGER,
      lang: DataTypes.STRING(2)
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true
    }
  );
  references_report.associate = function(models) {
    references_report.belongsTo(models.route, {
      foreignKey: "route_id",
      targetKey: "id"
    });
    // associations can be defined here
  };
  return references_report;
};
