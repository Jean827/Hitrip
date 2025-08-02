"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const Category_1 = __importDefault(require("./Category"));
class Product extends sequelize_1.Model {
}
Product.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        comment: '商品名称',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '商品描述',
    },
    categoryId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: '分类ID',
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '当前价格',
    },
    originalPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '原价',
    },
    discountPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '折扣价',
    },
    memberPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '会员价',
    },
    images: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '商品图片',
    },
    tags: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '商品标签',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否上架',
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '库存数量',
    },
    salesCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '销售数量',
    },
    rating: {
        type: sequelize_1.DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '评分',
    },
    reviewCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '评价数量',
    },
    weight: {
        type: sequelize_1.DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: '重量(kg)',
    },
    dimensions: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '尺寸',
    },
    brand: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '品牌',
    },
    model: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '型号',
    },
    warranty: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
        comment: '保修信息',
    },
    merchantId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        comment: '商家ID',
    },
}, {
    sequelize: sequelize_2.default,
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
});
Product.belongsTo(Category_1.default, {
    as: 'category',
    foreignKey: 'categoryId',
    targetKey: 'id',
});
exports.default = Product;
//# sourceMappingURL=Product.js.map