import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface RecommendationAttributes {
  id: number;
  userId: number;
  productId: number;
  score: number;
  recommendationType: 'collaborative' | 'content' | 'popular' | 'hybrid';
  reason?: string;
  isDisplayed: boolean;
  isClicked?: boolean;
  isPurchased?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecommendationCreationAttributes extends Omit<RecommendationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Recommendation extends Model<RecommendationAttributes, RecommendationCreationAttributes> implements RecommendationAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public score!: number;
  public recommendationType!: 'collaborative' | 'content' | 'popular' | 'hybrid';
  public reason?: string;
  public isDisplayed!: boolean;
  public isClicked?: boolean;
  public isPurchased?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Recommendation.init(
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
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    recommendationType: {
      type: DataTypes.ENUM('collaborative', 'content', 'popular', 'hybrid'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDisplayed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isClicked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isPurchased: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'recommendations',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['recommendationType'],
      },
      {
        fields: ['score'],
      },
      {
        fields: ['userId', 'productId'],
        unique: true,
      },
      {
        fields: ['userId', 'recommendationType'],
      },
    ],
  }
);

export default Recommendation; 