"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class UserSimilarity extends sequelize_1.Model {
}
UserSimilarity.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    similarUserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    similarity: {
        type: sequelize_1.DataTypes.DECIMAL(5, 4),
        allowNull: false,
        validate: {
            min: 0,
            max: 1,
        },
    },
    algorithm: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'cosine',
    },
    lastUpdated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'user_similarities',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['similarUserId'],
        },
        {
            fields: ['similarity'],
        },
    ],
});
exports.default = UserSimilarity;
//# sourceMappingURL=UserSimilarity.js.map