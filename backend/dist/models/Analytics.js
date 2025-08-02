"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessMetrics = exports.SystemMetrics = exports.SalesData = exports.UserBehavior = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class UserBehavior extends sequelize_1.Model {
}
exports.UserBehavior = UserBehavior;
UserBehavior.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID',
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '会话ID',
    },
    eventType: {
        type: sequelize_1.DataTypes.ENUM('page_view', 'click', 'search', 'purchase', 'add_to_cart', 'remove_from_cart', 'login', 'logout', 'register'),
        allowNull: false,
        comment: '事件类型',
    },
    eventName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '事件名称',
    },
    pageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: '页面URL',
    },
    referrer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: '来源页面',
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '用户代理',
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'IP地址',
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '事件时间',
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '元数据',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'user_behaviors',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['sessionId'],
        },
        {
            fields: ['eventType'],
        },
        {
            fields: ['timestamp'],
        },
    ],
});
class SalesData extends sequelize_1.Model {
}
exports.SalesData = SalesData;
SalesData.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '订单ID',
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '商品ID',
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID',
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '数量',
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '单价',
    },
    totalPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '总价',
    },
    discountAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: '折扣金额',
    },
    finalPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '最终价格',
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '支付方式',
    },
    orderStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'),
        allowNull: false,
        comment: '订单状态',
    },
    orderDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '下单时间',
    },
    paymentDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '支付时间',
    },
    shippingDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '发货时间',
    },
    deliveryDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '送达时间',
    },
    region: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '地区',
    },
    channel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '销售渠道',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'sales_data',
    timestamps: true,
    indexes: [
        {
            fields: ['orderId'],
        },
        {
            fields: ['productId'],
        },
        {
            fields: ['userId'],
        },
        {
            fields: ['orderDate'],
        },
        {
            fields: ['orderStatus'],
        },
        {
            fields: ['region'],
        },
    ],
});
class SystemMetrics extends sequelize_1.Model {
}
exports.SystemMetrics = SystemMetrics;
SystemMetrics.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    metricName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '指标名称',
    },
    metricValue: {
        type: sequelize_1.DataTypes.DECIMAL(10, 4),
        allowNull: false,
        comment: '指标值',
    },
    metricUnit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '指标单位',
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '记录时间',
    },
    serverId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: '服务器ID',
    },
    component: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: '组件名称',
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '元数据',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'system_metrics',
    timestamps: true,
    indexes: [
        {
            fields: ['metricName'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['component'],
        },
    ],
});
class BusinessMetrics extends sequelize_1.Model {
}
exports.BusinessMetrics = BusinessMetrics;
BusinessMetrics.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    metricName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '指标名称',
    },
    metricValue: {
        type: sequelize_1.DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: '指标值',
    },
    metricUnit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '指标单位',
    },
    period: {
        type: sequelize_1.DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
        allowNull: false,
        comment: '统计周期',
    },
    startTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '开始时间',
    },
    endTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '结束时间',
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '指标分类',
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '元数据',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'business_metrics',
    timestamps: true,
    indexes: [
        {
            fields: ['metricName'],
        },
        {
            fields: ['period'],
        },
        {
            fields: ['startTime'],
        },
        {
            fields: ['category'],
        },
    ],
});
exports.default = {
    UserBehavior,
    SalesData,
    SystemMetrics,
    BusinessMetrics,
};
//# sourceMappingURL=Analytics.js.map