
"use strict";
module.exports = (sequelize, DataTypes) => {
    const certain_permissions = sequelize.define(
        "certain_permissions",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            route_id: DataTypes.UUIDV4,
            user_id: DataTypes.UUIDV4,
            ctime: {
                allowNull: false,
                type: DataTypes.DATE
            },
            mtime: {
                allowNull: false,
                type: DataTypes.DATE
            },
            stime: DataTypes.BIGINT,
            ltime: DataTypes.BIGINT,
            signobject: DataTypes.JSON,
            maker: DataTypes.UUID,
            removed: DataTypes.INTEGER,
            allow_user: DataTypes.BOOLEAN,
            type_restriction: DataTypes.STRING(10)
        },
        {
            id: "id",
            createdAt: "ctime",
            updatedAt: "mtime",
            deletedAt: false,
            freezeTableName: true
        }
    );
    certain_permissions.associate = function (models) {
        // associations can be defined here
    };
    return certain_permissions;
};

