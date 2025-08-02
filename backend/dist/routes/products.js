"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, categoryId, search, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'DESC', isActive, } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { tags: { [sequelize_1.Op.contains]: [search] } },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price[sequelize_1.Op.gte] = Number(minPrice);
            if (maxPrice)
                where.price[sequelize_1.Op.lte] = Number(maxPrice);
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        const { count, rows } = await Product_1.default.findAndCountAll({
            where,
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
                {
                    model: Inventory_1.default,
                    as: 'inventory',
                    attributes: ['availableQuantity'],
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
            message: '获取商品列表失败',
            error: error.message,
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id, {
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Inventory_1.default,
                    as: 'inventory',
                    attributes: ['availableQuantity', 'lowStockThreshold'],
                },
            ],
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取商品详情失败',
            error: error.message,
        });
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'merchant']), async (req, res) => {
    try {
        const { name, description, categoryId, price, originalPrice, discountPrice, memberPrice, images, tags, stock, weight, dimensions, brand, model, warranty, } = req.body;
        if (!name || !description || !categoryId || !price || !originalPrice) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段',
            });
        }
        const category = await Category_1.default.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: '分类不存在',
            });
        }
        const product = await Product_1.default.create({
            name,
            description,
            categoryId,
            price: Number(price),
            originalPrice: Number(originalPrice),
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            memberPrice: memberPrice ? Number(memberPrice) : undefined,
            images: images || [],
            tags: tags || [],
            stock: Number(stock) || 0,
            weight: weight ? Number(weight) : undefined,
            dimensions,
            brand,
            model,
            warranty,
            merchantId: req.user.role === 'merchant' ? req.user.id : undefined,
        });
        await Inventory_1.default.create({
            productId: product.id,
            quantity: Number(stock) || 0,
            availableQuantity: Number(stock) || 0,
            lowStockThreshold: 10,
            maxStock: 1000,
        });
        res.status(201).json({
            success: true,
            message: '商品创建成功',
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '创建商品失败',
            error: error.message,
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'merchant']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '无权限修改此商品',
            });
        }
        await product.update(updateData);
        if (updateData.stock !== undefined) {
            const inventory = await Inventory_1.default.findOne({ where: { productId: id } });
            if (inventory) {
                await inventory.update({
                    quantity: Number(updateData.stock),
                    availableQuantity: Number(updateData.stock),
                });
            }
        }
        res.json({
            success: true,
            message: '商品更新成功',
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '更新商品失败',
            error: error.message,
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'merchant']), async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '无权限删除此商品',
            });
        }
        await Inventory_1.default.destroy({ where: { productId: id } });
        await product.destroy();
        res.json({
            success: true,
            message: '商品删除成功',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '删除商品失败',
            error: error.message,
        });
    }
});
router.patch('/:id/toggle-status', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'merchant']), async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        if (req.user.role === 'merchant' && product.merchantId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '无权限操作此商品',
            });
        }
        await product.update({ isActive: !product.isActive });
        res.json({
            success: true,
            message: `商品已${product.isActive ? '上架' : '下架'}`,
            data: { isActive: product.isActive },
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
router.get('/featured/hot', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const products = await Product_1.default.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['salesCount', 'DESC']],
            limit: Number(limit),
        });
        res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取热门商品失败',
            error: error.message,
        });
    }
});
router.get('/featured/recommended', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const products = await Product_1.default.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['rating', 'DESC']],
            limit: Number(limit),
        });
        res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取推荐商品失败',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map