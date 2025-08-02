import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// 用户行为数据模型
export interface UserBehaviorAttributes {
  id: number;
  userId?: number;
  sessionId: string;
  eventType: 'page_view' | 'click' | 'search' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'login' | 'logout' | 'register';
  eventName: string;
  pageUrl?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: any;
  createdAt: Date;
}

export interface UserBehaviorCreationAttributes extends Optional<UserBehaviorAttributes, 'id' | 'createdAt'> {}

export class UserBehavior extends Model<UserBehaviorAttributes, UserBehaviorCreationAttributes> implements UserBehaviorAttributes {
  public id!: number;
  public userId?: number;
  public sessionId!: string;
  public eventType!: 'page_view' | 'click' | 'search' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'login' | 'logout' | 'register';
  public eventName!: string;
  public pageUrl?: string;
  public referrer?: string;
  public userAgent?: string;
  public ipAddress?: string;
  public timestamp!: Date;
  public metadata?: any;
  public readonly createdAt!: Date;
}

UserBehavior.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID',
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '会话ID',
    },
    eventType: {
      type: DataTypes.ENUM('page_view', 'click', 'search', 'purchase', 'add_to_cart', 'remove_from_cart', 'login', 'logout', 'register'),
      allowNull: false,
      comment: '事件类型',
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '事件名称',
    },
    pageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '页面URL',
    },
    referrer: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '来源页面',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户代理',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP地址',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '事件时间',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '元数据',
    },
  },
  {
    sequelize,
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
  }
);

// 销售数据模型
export interface SalesDataAttributes {
  id: number;
  orderId: number;
  productId: number;
  userId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentMethod: string;
  orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  orderDate: Date;
  paymentDate?: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  region: string;
  channel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesDataCreationAttributes extends Optional<SalesDataAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class SalesData extends Model<SalesDataAttributes, SalesDataCreationAttributes> implements SalesDataAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public userId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public discountAmount!: number;
  public finalPrice!: number;
  public paymentMethod!: string;
  public orderStatus!: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  public orderDate!: Date;
  public paymentDate?: Date;
  public shippingDate?: Date;
  public deliveryDate?: Date;
  public region!: string;
  public channel!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '数量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总价',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '折扣金额',
    },
    finalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '最终价格',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '支付方式',
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'),
      allowNull: false,
      comment: '订单状态',
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '下单时间',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '支付时间',
    },
    shippingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发货时间',
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '送达时间',
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '地区',
    },
    channel: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '销售渠道',
    },
  },
  {
    sequelize,
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
  }
);

// 系统性能监控模型
export interface SystemMetricsAttributes {
  id: number;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  timestamp: Date;
  serverId?: string;
  component?: string;
  metadata?: any;
  createdAt: Date;
}

export interface SystemMetricsCreationAttributes extends Optional<SystemMetricsAttributes, 'id' | 'createdAt'> {}

export class SystemMetrics extends Model<SystemMetricsAttributes, SystemMetricsCreationAttributes> implements SystemMetricsAttributes {
  public id!: number;
  public metricName!: string;
  public metricValue!: number;
  public metricUnit!: string;
  public timestamp!: Date;
  public serverId?: string;
  public component?: string;
  public metadata?: any;
  public readonly createdAt!: Date;
}

SystemMetrics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    metricName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '指标名称',
    },
    metricValue: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: '指标值',
    },
    metricUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '指标单位',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '记录时间',
    },
    serverId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '服务器ID',
    },
    component: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '组件名称',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '元数据',
    },
  },
  {
    sequelize,
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
  }
);

// 业务指标模型
export interface BusinessMetricsAttributes {
  id: number;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime: Date;
  endTime: Date;
  category: string;
  metadata?: any;
  createdAt: Date;
}

export interface BusinessMetricsCreationAttributes extends Optional<BusinessMetricsAttributes, 'id' | 'createdAt'> {}

export class BusinessMetrics extends Model<BusinessMetricsAttributes, BusinessMetricsCreationAttributes> implements BusinessMetricsAttributes {
  public id!: number;
  public metricName!: string;
  public metricValue!: number;
  public metricUnit!: string;
  public period!: 'hourly' | 'daily' | 'weekly' | 'monthly';
  public startTime!: Date;
  public endTime!: Date;
  public category!: string;
  public metadata?: any;
  public readonly createdAt!: Date;
}

BusinessMetrics.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    metricName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '指标名称',
    },
    metricValue: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: '指标值',
    },
    metricUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '指标单位',
    },
    period: {
      type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
      allowNull: false,
      comment: '统计周期',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '指标分类',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '元数据',
    },
  },
  {
    sequelize,
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
  }
);

export default {
  UserBehavior,
  SalesData,
  SystemMetrics,
  BusinessMetrics,
}; 