import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { User } from './User';
import { Product } from './Product';

export enum OrderStatus {
  PENDING = 'pending',           // 待支付
  PAID = 'paid',                 // 已支付
  SHIPPED = 'shipped',           // 已发货
  DELIVERED = 'delivered',       // 已送达
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded'         // 已退款
}

export enum PaymentStatus {
  PENDING = 'pending',           // 待支付
  PAID = 'paid',                 // 已支付
  FAILED = 'failed',             // 支付失败
  REFUNDED = 'refunded'         // 已退款
}

export enum PaymentMethod {
  WECHAT = 'wechat',            // 微信支付
  ALIPAY = 'alipay',            // 支付宝
  BANK_CARD = 'bank_card'       // 银行卡
}

interface Address {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
}

interface OrderAttributes {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;           // 订单总金额
  paymentAmount: number;         // 实付金额
  discountAmount: number;        // 优惠金额
  shippingFee: number;          // 运费
  shippingAddress: Address;     // 收货地址
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTime?: Date;
  shippedTime?: Date;
  deliveredTime?: Date;
  completedTime?: Date;
  cancelledTime?: Date;
  cancelReason?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'orderNumber' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public userId!: string;
  public orderNumber!: string;
  public status!: OrderStatus;
  public totalAmount!: number;
  public paymentAmount!: number;
  public discountAmount!: number;
  public shippingFee!: number;
  public shippingAddress!: Address;
  public paymentMethod!: PaymentMethod;
  public paymentStatus!: PaymentStatus;
  public paymentTime?: Date;
  public shippedTime?: Date;
  public deliveredTime?: Date;
  public completedTime?: Date;
  public cancelledTime?: Date;
  public cancelReason?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly user?: User;
  public readonly orderItems?: any[];
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    paymentTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shippedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    sequelize,
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
  }
);

// 关联关系
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(require('./OrderItem').OrderItem, { foreignKey: 'orderId', as: 'orderItems' });

export default Order; 