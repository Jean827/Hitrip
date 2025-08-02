"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const User_1 = require("./User");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PAID"] = "paid";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["REFUNDED"] = "refunded";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WECHAT"] = "wechat";
    PaymentMethod["ALIPAY"] = "alipay";
    PaymentMethod["BANK_CARD"] = "bank_card";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
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
    orderNumber: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(OrderStatus)),
        allowNull: false,
        defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    paymentAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    discountAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    shippingFee: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    shippingAddress: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PaymentMethod)),
        allowNull: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
    },
    paymentTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    shippedTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deliveredTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    completedTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancelledTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancelReason: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    remark: {
        type: sequelize_1.DataTypes.STRING(1000),
        allowNull: true,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'orders',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['orderNumber'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['paymentStatus'],
        },
        {
            fields: ['createdAt'],
        },
    ],
});
Order.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(require('./OrderItem').OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
exports.default = Order;
//# sourceMappingURL=Order.js.map