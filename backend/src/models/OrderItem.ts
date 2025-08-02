import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Order } from './Order';
import { Product } from './Product';

interface OrderItemAttributes {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;        // 单价
  totalPrice: number;       // 总价
  discountPrice?: number;   // 优惠价
  specifications?: any;     // 商品规格
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public productName!: string;
  public productImage!: string;
  public productSku?: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public discountPrice?: number;
  public specifications?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly order?: Order;
  public readonly product?: Product;
}

OrderItem.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    productImage: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    productSku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['productId'],
      },
    ],
  }
);

// 关联关系
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export default OrderItem; 