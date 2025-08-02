"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class UserProfile extends sequelize_1.Model {
}
UserProfile.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    interests: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    behaviorPatterns: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
    },
    userValue: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100,
        },
    },
    userSegment: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new',
        validate: {
            isIn: [['new', 'active', 'vip', 'inactive']],
        },
    },
    lastUpdated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'user_profiles',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['userSegment'],
        },
        {
            fields: ['userValue'],
        },
    ],
});
exports.default = UserProfile;
//# sourceMappingURL=UserProfile.js.map