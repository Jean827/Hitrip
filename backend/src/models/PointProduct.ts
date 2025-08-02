import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface PointProductAttributes {
  id: string;
  name: string;
  description: string;
  image: string;
  points: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
  exchangeCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PointProductCreationAttributes extends Optional<PointProductAttributes, 'id' | 'exchangeCount' | 'createdAt' | 'updatedAt'> {}

class PointProduct extends Model<PointProductAttributes, PointProductCreationAttributes> implements PointProductAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public image!: string;
  public points!: number;
  public stock!: number;
  public status!: 'active' | 'inactive' | 'out_of_stock';
  public category!: string;
  public exchangeCount!: number;
  public createdBy!: string;
  public updatedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PointProduct.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
      defaultValue: 'active',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    exchangeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'point_products',
    timestamps: true,
  }
);

export default PointProduct; 