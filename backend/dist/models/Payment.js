"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentMethod = exports.PaymentStatus = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const User_1 = require("./User");
const Order_1 = require("./Order");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIAL_REFUNDED"] = "partial_refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["WECHAT"] = "wechat";
    PaymentMethod["ALIPAY"] = "alipay";
    PaymentMethod["BANK_CARD"] = "bank_card";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
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
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PaymentMethod)),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
    },
    transactionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    refundAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    refundTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    refundReason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    callbackData: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    remark: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'payments',
    timestamps: true,
    indexes: [
        {
            fields: ['orderId'],
        },
        {
            fields: ['userId'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['transactionId'],
        },
        {
            fields: ['paymentTime'],
        },
    ],
});
Payment.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Order_1.Order, { foreignKey: 'orderId', as: 'order' });
exports.default = Payment;
//# sourceMappingURL=Payment.js.map