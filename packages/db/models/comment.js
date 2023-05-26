"use strict";
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define(
    "comment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      ticket_id: DataTypes.UUID,
      sender: DataTypes.STRING,
      receiver: DataTypes.STRING,
      message: DataTypes.TEXT,
      file_id: DataTypes.JSON,
      file_name: DataTypes.JSON,
      file_size: DataTypes.JSON,
      realm_id: DataTypes.UUID,
      is_user_message: DataTypes.BOOLEAN,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      is_new: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  comment.associate = function(models) {
    comment.belongsTo(models.ticket, {
      foreignKey: "ticket_id",
      targetKey: "id"
    });
  };
  return comment;
};
