"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class Category extends sequelize_1.Model {
}
Category.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        comment: '分类名称',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '分类描述',
    },
    parentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        comment: '父分类ID',
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    level: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '分类层级',
    },
    sortOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序顺序',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否激活',
    },
    icon: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '分类图标',
    },
    image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: '分类图片',
    },
}, {
    sequelize: sequelize_2.default,
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
});
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
exports.default = Category;
//# sourceMappingURL=Category.js.map