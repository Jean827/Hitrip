"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const Product_1 = __importDefault(require("./Product"));
class Inventory extends sequelize_1.Model {
}
Inventory.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: '商品ID',
        references: {
            model: 'products',
            key: 'id',
        },
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总库存数量',
    },
    reservedQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '预留库存数量',
    },
    availableQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '可用库存数量',
    },
    lowStockThreshold: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        comment: '低库存阈值',
    },
    maxStock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        comment: '最大库存数量',
    },
    location: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
        comment: '库存位置',
    },
    batchNumber: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '批次号',
    },
    expiryDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '过期日期',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'inventories',
    timestamps: true,
    indexes: [
        {
            fields: ['productId'],
            unique: true,
        },
        {
            fields: ['availableQuantity'],
        },
        {
            fields: ['lowStockThreshold'],
        },
    ],
});
Inventory.belongsTo(Product_1.default, {
    as: 'product',
    foreignKey: 'productId',
    targetKey: 'id',
});
exports.default = Inventory;
//# sourceMappingURL=Inventory.js.map