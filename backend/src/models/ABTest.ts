import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface ABTestAttributes {
  id: number;
  userId: number;
  testName: string;
  variant: string; // 'A' or 'B'
  recommendationType: string;
  productIds: string; // JSON string of product IDs
  clicks: boolean;
  purchases: boolean;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ABTestCreationAttributes extends Optional<ABTestAttributes, 'id' | 'clicks' | 'purchases' | 'createdAt' | 'updatedAt'> {}

class ABTest extends Model<ABTestAttributes, ABTestCreationAttributes> implements ABTestAttributes {
  public id!: number;
  public userId!: number;
  public testName!: string;
  public variant!: string;
  public recommendationType!: string;
  public productIds!: string;
  public clicks!: boolean;
  public purchases!: boolean;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ABTest.init(
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
    testName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant: {
      type: DataTypes.STRING(1),
      allowNull: false,
      validate: {
        isIn: [['A', 'B']],
      },
    },
    recommendationType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productIds: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    clicks: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    purchases: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'ab_tests',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'testName'],
      },
      {
        fields: ['testName', 'variant'],
      },
      {
        fields: ['timestamp'],
      },
    ],
  }
);

export default ABTest; 