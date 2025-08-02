"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class SearchHistory extends sequelize_1.Model {
}
SearchHistory.init({
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
    query: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    resultCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'search_history',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['query'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['userId', 'timestamp'],
        },
    ],
});
exports.default = SearchHistory;
//# sourceMappingURL=SearchHistory.js.map