import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface UserBehaviorAttributes {
  id: number;
  userId: number;
  productId?: number;
  categoryId?: number;
  behaviorType: 'view' | 'click' | 'purchase' | 'cart' | 'favorite' | 'search';
  behaviorData?: any;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBehaviorCreationAttributes extends Omit<UserBehaviorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserBehavior extends Model<UserBehaviorAttributes, UserBehaviorCreationAttributes> implements UserBehaviorAttributes {
  public id!: number;
  public userId!: number;
  public productId?: number;
  public categoryId?: number;
  public behaviorType!: 'view' | 'click' | 'purchase' | 'cart' | 'favorite' | 'search';
  public behaviorData?: any;
  public sessionId?: string;
  public userAgent?: string;
  public ipAddress?: string;
  public referrer?: string;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    behaviorType: {
      type: DataTypes.ENUM('view', 'click', 'purchase', 'cart', 'favorite', 'search'),
      allowNull: false,
    },
    behaviorData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referrer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
        fields: ['productId'],
      },
      {
        fields: ['behaviorType'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['userId', 'behaviorType'],
      },
      {
        fields: ['productId', 'behaviorType'],
      },
    ],
  }
);

export default UserBehavior; 