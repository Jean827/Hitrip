"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class MarketingCampaign extends sequelize_1.Model {
}
MarketingCampaign.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('discount', 'full_reduction', 'points', 'free_shipping'),
        allowNull: false,
    },
    startTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('draft', 'active', 'paused', 'ended'),
        defaultValue: 'draft',
    },
    rules: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    budget: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    targetAudience: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    statistics: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'marketing_campaigns',
    timestamps: true,
});
exports.default = MarketingCampaign;
//# sourceMappingURL=MarketingCampaign.js.map