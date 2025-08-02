"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
class ItemSimilarity extends sequelize_1.Model {
}
ItemSimilarity.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    productId1: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    productId2: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    similarity: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
            max: 1,
        },
    },
    similarityType: {
        type: sequelize_1.DataTypes.ENUM('content', 'collaborative', 'hybrid'),
        allowNull: false,
    },
    lastCalculated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'item_similarities',
    timestamps: true,
    indexes: [
        {
            fields: ['productId1'],
        },
        {
            fields: ['productId2'],
        },
        {
            fields: ['similarityType'],
        },
        {
            fields: ['productId1', 'productId2'],
            unique: true,
        },
        {
            fields: ['similarity'],
        },
    ],
});
exports.default = ItemSimilarity;
//# sourceMappingURL=ItemSimilarity.js.map