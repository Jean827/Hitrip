import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { User } from './User';

export enum MerchantStatus {
  PENDING = 'pending',           // 待审核
  ACTIVE = 'active',             // 正常营业
  SUSPENDED = 'suspended',       // 暂停营业
  REJECTED = 'rejected',         // 审核拒绝
  CLOSED = 'closed'              // 已关闭
}

export enum VerificationStatus {
  PENDING = 'pending',           // 待认证
  VERIFIED = 'verified',         // 已认证
  REJECTED = 'rejected'          // 认证失败
}

interface MerchantAttributes {
  id: string;
  userId: string;
  name: string;                  // 商家名称
  description: string;           // 商家描述
  logo: string;                 // 商家logo
  banner: string;               // 商家横幅
  contactPhone: string;         // 联系电话
  contactEmail: string;         // 联系邮箱
  address: string;              // 商家地址
  businessLicense: string;      // 营业执照
  idCardFront: string;          // 身份证正面
  idCardBack: string;           // 身份证背面
  status: MerchantStatus;       // 商家状态
  verificationStatus: VerificationStatus; // 认证状态
  verificationTime?: Date;      // 认证时间
  verificationRemark?: string;  // 认证备注
  commissionRate: number;       // 佣金比例
  settlementAccount: string;    // 结算账户
  settlementBank: string;       // 结算银行
  totalSales: number;          // 总销售额
  totalOrders: number;         // 总订单数
  rating: number;              // 商家评分
  createdAt: Date;
  updatedAt: Date;
}

interface MerchantCreationAttributes extends Optional<MerchantAttributes, 'id' | 'status' | 'verificationStatus' | 'commissionRate' | 'totalSales' | 'totalOrders' | 'rating' | 'createdAt' | 'updatedAt'> {}

export class Merchant extends Model<MerchantAttributes, MerchantCreationAttributes> implements MerchantAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public description!: string;
  public logo!: string;
  public banner!: string;
  public contactPhone!: string;
  public contactEmail!: string;
  public address!: string;
  public businessLicense!: string;
  public idCardFront!: string;
  public idCardBack!: string;
  public status!: MerchantStatus;
  public verificationStatus!: VerificationStatus;
  public verificationTime?: Date;
  public verificationRemark?: string;
  public commissionRate!: number;
  public settlementAccount!: string;
  public settlementBank!: string;
  public totalSales!: number;
  public totalOrders!: number;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly user?: User;
  public readonly products?: any[];
}

Merchant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    businessLicense: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idCardFront: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idCardBack: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MerchantStatus)),
      allowNull: false,
      defaultValue: MerchantStatus.PENDING,
    },
    verificationStatus: {
      type: DataTypes.ENUM(...Object.values(VerificationStatus)),
      allowNull: false,
      defaultValue: VerificationStatus.PENDING,
    },
    verificationTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00, // 默认5%佣金
    },
    settlementAccount: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    settlementBank: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    totalSales: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.00,
    },
  },
  {
    sequelize,
    tableName: 'merchants',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['verificationStatus'],
      },
      {
        fields: ['name'],
      },
    ],
  }
);

// 关联关系
Merchant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Merchant; 