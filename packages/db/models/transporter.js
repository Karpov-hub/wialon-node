"use strict";
module.exports = (sequelize, DataTypes) => {
  const transporter = sequelize.define(
    "transporter",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },

      host_transporter: DataTypes.STRING(20),
      port_transporter: DataTypes.INTEGER,
      secure_transporter: DataTypes.BOOLEAN,
      user_transporter: DataTypes.STRING(30),
      password_transporter: DataTypes.STRING(40),

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  transporter.associate = function(models) {
    // associations can be defined here
  };
  return transporter;
};
