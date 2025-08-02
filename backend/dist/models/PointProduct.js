"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class PointProduct extends sequelize_1.Model {
}
PointProduct.init({
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
    image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
        defaultValue: 'active',
    },
    category: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    exchangeCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    tableName: 'point_products',
    timestamps: true,
});
exports.default = PointProduct;
//# sourceMappingURL=PointProduct.js.map