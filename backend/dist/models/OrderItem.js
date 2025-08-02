"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const Order_1 = require("./Order");
const Product_1 = require("./Product");
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id',
        },
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    productName: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
    },
    productImage: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
    },
    productSku: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    totalPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discountPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    specifications: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'order_items',
    timestamps: true,
    indexes: [
        {
            fields: ['orderId'],
        },
        {
            fields: ['productId'],
        },
    ],
});
OrderItem.belongsTo(Order_1.Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product_1.Product, { foreignKey: 'productId', as: 'product' });
exports.default = OrderItem;
//# sourceMappingURL=OrderItem.js.map