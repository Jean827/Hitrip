import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import Product from './Product';

// 库存接口定义
export interface InventoryAttributes {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  maxStock: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选字段
export interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id' | 'reservedQuantity' | 'availableQuantity' | 'createdAt' | 'updatedAt'> {}

// 库存模型
class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public id!: string;
  public productId!: string;
  public quantity!: number;
  public reservedQuantity!: number;
  public availableQuantity!: number;
  public lowStockThreshold!: number;
  public maxStock!: number;
  public location?: string;
  public batchNumber?: string;
  public expiryDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly product?: Product;
}

Inventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '商品ID',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总库存数量',
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '预留库存数量',
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '可用库存数量',
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: '低库存阈值',
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
      comment: '最大库存数量',
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '库存位置',
    },
    batchNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '批次号',
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期日期',
    },
  },
  {
    sequelize,
    tableName: 'inventories',
    timestamps: true,
    indexes: [
      {
        fields: ['productId'],
        unique: true,
      },
      {
        fields: ['availableQuantity'],
      },
      {
        fields: ['lowStockThreshold'],
      },
    ],
  }
);

// 定义关联关系
Inventory.belongsTo(Product, {
  as: 'product',
  foreignKey: 'productId',
  targetKey: 'id',
});

export default Inventory; 