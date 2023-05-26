"use strict";
module.exports = (sequelize, DataTypes) => {
  const letter = sequelize.define(
    "letter",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm: {
        type: DataTypes.UUID
      },
      transporter: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "transporters",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      code: DataTypes.TEXT,
      letter_name: DataTypes.STRING,
      lang: DataTypes.STRING,
      from_email: DataTypes.STRING,
      from: DataTypes.STRING,
      to: DataTypes.STRING,
      subject: DataTypes.STRING,
      text: DataTypes.TEXT,
      html: DataTypes.TEXT,
      data: DataTypes.TEXT,
      attachment_name: DataTypes.STRING,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  letter.associate = function(models) {
    // associations can be defined here
  };
  return letter;
};
