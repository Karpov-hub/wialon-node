"use strict";
module.exports = (sequelize, DataTypes) => {
  const report_label = sequelize.define(
    "report_label",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      report_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "route",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      lang: DataTypes.STRING(2),
      report_name: DataTypes.STRING,
      description: DataTypes.TEXT,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  report_label.associate = function(models) {
    report_label.belongsTo(models.route, {
      foreignKey: "report_id",
      targetKey: "id"
    });
    // associations can be defined here
  };
  return report_label;
};
