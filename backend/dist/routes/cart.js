"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_1 = require("../models/Cart");
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart_1.Cart.findOne({
            where: { userId },
            include: [
                {
                    model: Cart_1.CartItem,
                    as: 'items',
                    include: [
                        {
                            model: Product_1.default,
                            as: 'product',
                            attributes: ['id', 'name', 'images', 'price', 'originalPrice', 'stock', 'categoryId'],
                        },
                    ],
                },
            ],
        });
        if (!cart) {
            cart = await Cart_1.Cart.create({ userId });
        }
        const totalAmount = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        const itemCount = cart.items?.length || 0;
        res.json({
            success: true,
            data: {
                id: cart.id,
                items: cart.items || [],
                totalAmount,
                itemCount,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取购物车失败',
            error: error.message,
        });
    }
});
router.post('/items', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: '商品ID不能为空',
            });
        }
        const product = await Product_1.default.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在',
            });
        }
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: '商品已下架',
            });
        }
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: '商品库存不足',
            });
        }
        let cart = await Cart_1.Cart.findOne({ where: { userId } });
        if (!cart) {
            cart = await Cart_1.Cart.create({ userId });
        }
        const existingItem = await Cart_1.CartItem.findOne({
            where: { cartId: cart.id, productId },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: '商品库存不足',
                });
            }
            await existingItem.update({
                quantity: newQuantity,
                price: product.discountPrice || product.price,
            });
        }
        else {
            await Cart_1.CartItem.create({
                cartId: cart.id,
                productId,
                quantity,
                price: product.discountPrice || product.price,
            });
        }
        res.json({
            success: true,
            message: '商品已添加到购物车',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '添加商品失败',
            error: error.message,
        });
    }
});
router.put('/items/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: '数量必须大于0',
            });
        }
        const cartItem = await Cart_1.CartItem.findOne({
            where: { id },
            include: [
                {
                    model: Cart_1.Cart,
                    as: 'cart',
                    where: { userId },
                },
                {
                    model: Product_1.default,
                    as: 'product',
                },
            ],
        });
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: '购物车商品不存在',
            });
        }
        if (cartItem.product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: '商品库存不足',
            });
        }
        await cartItem.update({
            quantity,
            price: cartItem.product.discountPrice || cartItem.product.price,
        });
        res.json({
            success: true,
            message: '数量更新成功',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '更新数量失败',
            error: error.message,
        });
    }
});
router.delete('/items/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const cartItem = await Cart_1.CartItem.findOne({
            where: { id },
            include: [
                {
                    model: Cart_1.Cart,
                    as: 'cart',
                    where: { userId },
                },
            ],
        });
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: '购物车商品不存在',
            });
        }
        await cartItem.destroy();
        res.json({
            success: true,
            message: '商品已删除',
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
router.delete('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart_1.Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在',
            });
        }
        await Cart_1.CartItem.destroy({ where: { cartId: cart.id } });
        res.json({
            success: true,
            message: '购物车已清空',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '清空购物车失败',
            error: error.message,
        });
    }
});
router.delete('/items', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemIds } = req.body;
        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请选择要删除的商品',
            });
        }
        const cart = await Cart_1.Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: '购物车不存在',
            });
        }
        await Cart_1.CartItem.destroy({
            where: {
                id: itemIds,
                cartId: cart.id,
            },
        });
        res.json({
            success: true,
            message: '商品已删除',
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
router.get('/count', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart_1.Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.json({
                success: true,
                data: { count: 0 },
            });
        }
        const count = await Cart_1.CartItem.count({ where: { cartId: cart.id } });
        res.json({
            success: true,
            data: { count },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取购物车数量失败',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map