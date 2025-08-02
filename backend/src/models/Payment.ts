import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { User } from './User';
import { Order } from './Order';

export enum PaymentStatus {
  PENDING = 'pending',           // 待支付
  PAID = 'paid',                 // 已支付
  FAILED = 'failed',             // 支付失败
  REFUNDED = 'refunded',        // 已退款
  PARTIAL_REFUNDED = 'partial_refunded'  // 部分退款
}

export enum PaymentMethod {
  WECHAT = 'wechat',            // 微信支付
  ALIPAY = 'alipay',            // 支付宝
  BANK_CARD = 'bank_card'       // 银行卡
}

interface PaymentAttributes {
  id: string;
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  amount: number;                // 支付金额
  status: PaymentStatus;
  transactionId?: string;        // 第三方支付交易ID
  paymentTime?: Date;           // 支付时间
  refundAmount: number;         // 退款金额
  refundTime?: Date;           // 退款时间
  refundReason?: string;       // 退款原因
  callbackData?: any;          // 支付回调数据
  remark?: string;             // 备注
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'refundAmount' | 'createdAt' | 'updatedAt'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public orderId!: string;
  public userId!: string;
  public paymentMethod!: PaymentMethod;
  public amount!: number;
  public status!: PaymentStatus;
  public transactionId?: string;
  public paymentTime?: Date;
  public refundAmount!: number;
  public refundTime?: Date;
  public refundReason?: string;
  public callbackData?: any;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly user?: User;
  public readonly order?: Order;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    refundTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    callbackData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
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
  }
);

// 关联关系
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export default Payment; 