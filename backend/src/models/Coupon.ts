import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface CouponAttributes {
  id: string;
  code: string;
  name: string;
  type: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
  discountValue: number;
  minAmount: number;
  maxDiscount: number;
  startTime: Date;
  endTime: Date;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts: string[];
  applicableUsers: string[];
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'> {}

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public type!: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
  public discountValue!: number;
  public minAmount!: number;
  public maxDiscount!: number;
  public startTime!: Date;
  public endTime!: Date;
  public usageLimit!: number;
  public usedCount!: number;
  public status!: 'active' | 'inactive' | 'expired';
  public applicableProducts!: string[];
  public applicableUsers!: string[];
  public createdBy!: string;
  public updatedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('discount', 'full_reduction', 'free_shipping', 'points'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: -1, // -1表示无限制
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      defaultValue: 'active',
    },
    applicableProducts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    applicableUsers: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'coupons',
    timestamps: true,
  }
);

export default Coupon; 