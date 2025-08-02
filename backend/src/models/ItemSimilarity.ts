import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface ItemSimilarityAttributes {
  id: number;
  productId1: number;
  productId2: number;
  similarity: number;
  similarityType: 'content' | 'collaborative' | 'hybrid';
  lastCalculated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ItemSimilarityCreationAttributes extends Omit<ItemSimilarityAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ItemSimilarity extends Model<ItemSimilarityAttributes, ItemSimilarityCreationAttributes> implements ItemSimilarityAttributes {
  public id!: number;
  public productId1!: number;
  public productId2!: number;
  public similarity!: number;
  public similarityType!: 'content' | 'collaborative' | 'hybrid';
  public lastCalculated!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ItemSimilarity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    similarity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    similarityType: {
      type: DataTypes.ENUM('content', 'collaborative', 'hybrid'),
      allowNull: false,
    },
    lastCalculated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'item_similarities',
    timestamps: true,
    indexes: [
      {
        fields: ['productId1'],
      },
      {
        fields: ['productId2'],
      },
      {
        fields: ['similarityType'],
      },
      {
        fields: ['productId1', 'productId2'],
        unique: true,
      },
      {
        fields: ['similarity'],
      },
    ],
  }
);

export default ItemSimilarity; 