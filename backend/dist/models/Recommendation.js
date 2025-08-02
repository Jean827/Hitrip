"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
class Recommendation extends sequelize_1.Model {
}
Recommendation.init({
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
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    score: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
            max: 1,
        },
    },
    recommendationType: {
        type: sequelize_1.DataTypes.ENUM('collaborative', 'content', 'popular', 'hybrid'),
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isDisplayed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isClicked: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
    isPurchased: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'recommendations',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['productId'],
        },
        {
            fields: ['recommendationType'],
        },
        {
            fields: ['score'],
        },
        {
            fields: ['userId', 'productId'],
            unique: true,
        },
        {
            fields: ['userId', 'recommendationType'],
        },
    ],
});
exports.default = Recommendation;
//# sourceMappingURL=Recommendation.js.map