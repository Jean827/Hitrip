"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class Coupon extends sequelize_1.Model {
}
Coupon.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('discount', 'full_reduction', 'free_shipping', 'points'),
        allowNull: false,
    },
    discountValue: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    minAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    maxDiscount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    startTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    usageLimit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1,
    },
    usedCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active',
    },
    applicableProducts: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    applicableUsers: {
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
    tableName: 'coupons',
    timestamps: true,
});
exports.default = Coupon;
//# sourceMappingURL=Coupon.js.map