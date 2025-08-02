import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// 分类接口定义
export interface CategoryAttributes {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选字段
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'level' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// 分类模型
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public parentId?: string;
  public level!: number;
  public sortOrder!: number;
  public isActive!: boolean;
  public icon?: string;
  public image?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  public readonly parent?: Category;
  public readonly children?: Category[];
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '分类描述',
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父分类ID',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '分类层级',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否激活',
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分类图标',
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类图片',
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    indexes: [
      {
        fields: ['parentId'],
      },
      {
        fields: ['level'],
      },
      {
        fields: ['sortOrder'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

// 定义关联关系
Category.hasMany(Category, {
  as: 'children',
  foreignKey: 'parentId',
  sourceKey: 'id',
});

Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parentId',
  targetKey: 'id',
});

export default Category; 