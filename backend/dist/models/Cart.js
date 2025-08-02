"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = exports.Cart = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const User_1 = __importDefault(require("./User"));
const Product_1 = __importDefault(require("./Product"));
class Cart extends sequelize_1.Model {
}
exports.Cart = Cart;
Cart.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: '用户ID',
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'carts',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
            unique: true,
        },
    ],
});
class CartItem extends sequelize_1.Model {
}
exports.CartItem = CartItem;
CartItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    cartId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: '购物车ID',
        references: {
            model: 'carts',
            key: 'id',
        },
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
        defaultValue: 1,
        comment: '数量',
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '价格',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
        {
            fields: ['cartId'],
        },
        {
            fields: ['productId'],
        },
        {
            fields: ['cartId', 'productId'],
            unique: true,
        },
    ],
});
Cart.belongsTo(User_1.default, {
    as: 'user',
    foreignKey: 'userId',
    targetKey: 'id',
});
Cart.hasMany(CartItem, {
    as: 'items',
    foreignKey: 'cartId',
    sourceKey: 'id',
});
CartItem.belongsTo(Cart, {
    as: 'cart',
    foreignKey: 'cartId',
    targetKey: 'id',
});
CartItem.belongsTo(Product_1.default, {
    as: 'product',
    foreignKey: 'productId',
    targetKey: 'id',
});
exports.default = Cart;
//# sourceMappingURL=Cart.js.map