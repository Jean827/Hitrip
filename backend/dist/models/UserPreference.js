"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class UserPreference extends sequelize_1.Model {
}
UserPreference.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    categoryId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    preferenceScore: {
        type: sequelize_1.DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
            min: 0,
            max: 1,
        },
    },
    lastUpdated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'user_preferences',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'categoryId'],
        },
    ],
});
exports.default = UserPreference;
//# sourceMappingURL=UserPreference.js.map