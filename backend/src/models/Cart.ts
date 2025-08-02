import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';
import Product from './Product';

// 购物车接口定义
export interface CartAttributes {
  id: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选字段
export interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 购物车模型
class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly user?: User;
  public readonly items?: CartItem[];
}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '用户ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'carts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
        unique: true,
      },
    ],
  }
);

// 购物车项接口定义
export interface CartItemAttributes {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选字段
export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 购物车项模型
class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: string;
  public cartId!: string;
  public productId!: string;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly cart?: Cart;
  public readonly product?: Product;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '购物车ID',
      references: {
        model: 'carts',
        key: 'id',
      },
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
      defaultValue: 1,
      comment: '数量',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格',
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      {
        fields: ['cartId'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['cartId', 'productId'],
        unique: true,
      },
    ],
  }
);

// 定义关联关系
Cart.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
  targetKey: 'id',
});

Cart.hasMany(CartItem, {
  as: 'items',
  foreignKey: 'cartId',
  sourceKey: 'id',
});

CartItem.belongsTo(Cart, {
  as: 'cart',
  foreignKey: 'cartId',
  targetKey: 'id',
});

CartItem.belongsTo(Product, {
  as: 'product',
  foreignKey: 'productId',
  targetKey: 'id',
});

export { Cart, CartItem };
export default Cart; 