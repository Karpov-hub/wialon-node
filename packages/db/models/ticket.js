"use strict";
module.exports = (sequelize, DataTypes) => {
  const ticket = sequelize.define(
    "ticket",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      number_of_ticket: DataTypes.STRING,
      status: DataTypes.INTEGER,
      type: DataTypes.INTEGER,
      title: DataTypes.STRING,
      category: DataTypes.STRING,
      message: DataTypes.TEXT,
      file_id: DataTypes.JSON,
      file_name: DataTypes.JSON,
      file_size: DataTypes.JSON,
      user_id: DataTypes.UUID,
      realm_id: DataTypes.UUID,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: DataTypes.INTEGER,
      last_comment_date: {
        type: DataTypes.DATE
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  ticket.associate = function(models) {
    ticket.hasMany(models.comment, {
      foreignKey: "ticket_id"
    });
  };

  ticket.adminModelName = "Crm.modules.support.model.SupportModel";

  return ticket;
};
