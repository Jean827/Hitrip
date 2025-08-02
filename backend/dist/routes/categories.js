"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { level, parentId, isActive } = req.query;
        const where = {};
        if (level) {
            where.level = Number(level);
        }
        if (parentId) {
            where.parentId = parentId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        const categories = await Category_1.default.findAll({
            where,
            include: [
                {
                    model: Category_1.default,
                    as: 'children',
                    attributes: ['id', 'name', 'level'],
                    where: { isActive: true },
                    required: false,
                },
                {
                    model: Category_1.default,
                    as: 'parent',
                    attributes: ['id', 'name', 'level'],
                    required: false,
                },
            ],
            order: [
                ['sortOrder', 'ASC'],
                ['name', 'ASC'],
            ],
        });
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类列表失败',
            error: error.message,
        });
    }
});
router.get('/tree', async (req, res) => {
    try {
        const categories = await Category_1.default.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Category_1.default,
                    as: 'children',
                    attributes: ['id', 'name', 'level', 'icon'],
                    where: { isActive: true },
                    required: false,
                },
            ],
            order: [
                ['sortOrder', 'ASC'],
                ['name', 'ASC'],
            ],
        });
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                ...item.toJSON(),
                children: buildTree(items, item.id),
            }));
        };
        const tree = buildTree(categories);
        res.json({
            success: true,
            data: tree,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类树失败',
            error: error.message,
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id, {
            include: [
                {
                    model: Category_1.default,
                    as: 'children',
                    attributes: ['id', 'name', 'level'],
                    where: { isActive: true },
                    required: false,
                },
                {
                    model: Category_1.default,
                    as: 'parent',
                    attributes: ['id', 'name', 'level'],
                    required: false,
                },
            ],
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '分类不存在',
            });
        }
        res.json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类详情失败',
            error: error.message,
        });
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { name, description, parentId, sortOrder, icon, image, } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段',
            });
        }
        let level = 1;
        if (parentId) {
            const parent = await Category_1.default.findByPk(parentId);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: '父分类不存在',
                });
            }
            level = parent.level + 1;
        }
        const category = await Category_1.default.create({
            name,
            description,
            parentId,
            level,
            sortOrder: sortOrder || 0,
            icon,
            image,
        });
        res.status(201).json({
            success: true,
            message: '分类创建成功',
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '创建分类失败',
            error: error.message,
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '分类不存在',
            });
        }
        if (updateData.parentId && updateData.parentId !== category.parentId) {
            const parent = await Category_1.default.findByPk(updateData.parentId);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: '父分类不存在',
                });
            }
            updateData.level = parent.level + 1;
        }
        await category.update(updateData);
        res.json({
            success: true,
            message: '分类更新成功',
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '更新分类失败',
            error: error.message,
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '分类不存在',
            });
        }
        const childrenCount = await Category_1.default.count({ where: { parentId: id } });
        if (childrenCount > 0) {
            return res.status(400).json({
                success: false,
                message: '该分类下有子分类，无法删除',
            });
        }
        const productsCount = await Product_1.default.count({ where: { categoryId: id } });
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: '该分类下有商品，无法删除',
            });
        }
        await category.destroy();
        res.json({
            success: true,
            message: '分类删除成功',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '删除分类失败',
            error: error.message,
        });
    }
});
router.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const getAllChildIds = async (categoryId) => {
            const children = await Category_1.default.findAll({ where: { parentId: categoryId } });
            const childIds = children.map(child => child.id);
            const grandChildIds = await Promise.all(children.map(child => getAllChildIds(child.id)));
            return [categoryId, ...childIds, ...grandChildIds.flat()];
        };
        const categoryIds = await getAllChildIds(id);
        const { count, rows } = await Product_1.default.findAndCountAll({
            where: {
                categoryId: { [sequelize_1.Op.in]: categoryIds },
                isActive: true,
            },
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            order: [[sortBy, sortOrder]],
            limit: Number(limit),
            offset,
        });
        res.json({
            success: true,
            data: {
                products: rows,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil(count / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类商品失败',
            error: error.message,
        });
    }
});
router.patch('/:id/toggle-status', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '分类不存在',
            });
        }
        await category.update({ isActive: !category.isActive });
        res.json({
            success: true,
            message: `分类已${category.isActive ? '启用' : '禁用'}`,
            data: { isActive: category.isActive },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '操作失败',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map