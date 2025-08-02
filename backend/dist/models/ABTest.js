"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class ABTest extends sequelize_1.Model {
}
ABTest.init({
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
    testName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    variant: {
        type: sequelize_1.DataTypes.STRING(1),
        allowNull: false,
        validate: {
            isIn: [['A', 'B']],
        },
    },
    recommendationType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    productIds: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    clicks: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    purchases: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'ab_tests',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'testName'],
        },
        {
            fields: ['testName', 'variant'],
        },
        {
            fields: ['timestamp'],
        },
    ],
});
exports.default = ABTest;
//# sourceMappingURL=ABTest.js.map