import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import Category from './Category';

// 商品接口定义
export interface ProductAttributes {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice: number;
  discountPrice?: number;
  memberPrice?: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  stock: number;
  salesCount: number;
  rating: number;
  reviewCount: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  warranty?: string;
  merchantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选字段
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'salesCount' | 'rating' | 'reviewCount' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// 商品模型
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public categoryId!: string;
  public price!: number;
  public originalPrice!: number;
  public discountPrice?: number;
  public memberPrice?: number;
  public images!: string[];
  public tags!: string[];
  public isActive!: boolean;
  public stock!: number;
  public salesCount!: number;
  public rating!: number;
  public reviewCount!: number;
  public weight?: number;
  public dimensions?: string;
  public brand?: string;
  public model?: string;
  public warranty?: string;
  public merchantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly category?: Category;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '商品描述',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '分类ID',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '当前价格',
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '原价',
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '折扣价',
    },
    memberPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '会员价',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '商品图片',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '商品标签',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否上架',
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '库存数量',
    },
    salesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '销售数量',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '评分',
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '评价数量',
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '重量(kg)',
    },
    dimensions: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '尺寸',
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '品牌',
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '型号',
    },
    warranty: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '保修信息',
    },
    merchantId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '商家ID',
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['price'],
      },
      {
        fields: ['salesCount'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['merchantId'],
      },
    ],
  }
);

// 定义关联关系
Product.belongsTo(Category, {
  as: 'category',
  foreignKey: 'categoryId',
  targetKey: 'id',
});

export default Product; 