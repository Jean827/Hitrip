"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
class UserBehavior extends sequelize_1.Model {
}
UserBehavior.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    behaviorType: {
        type: sequelize_1.DataTypes.ENUM('view', 'click', 'purchase', 'cart', 'favorite', 'search'),
        allowNull: false,
    },
    behaviorData: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    referrer: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'user_behaviors',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['productId'],
        },
        {
            fields: ['behaviorType'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['userId', 'behaviorType'],
        },
        {
            fields: ['productId', 'behaviorType'],
        },
    ],
});
exports.default = UserBehavior;
//# sourceMappingURL=UserBehavior.js.map