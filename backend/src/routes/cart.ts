import express from 'express';
import { Cart, CartItem } from '../models/Cart';
import Product from '../models/Product';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = express.Router();

// 获取用户购物车
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取或创建购物车
    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'images', 'price', 'originalPrice', 'stock', 'categoryId'],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // 计算总金额和商品数量
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取购物车失败',
      error: error.message,
    });
  }
});

// 添加商品到购物车
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '商品ID不能为空',
      });
    }

    // 验证商品是否存在
    const product = await Product.findByPk(productId);
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

    // 验证库存
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '商品库存不足',
      });
    }

    // 获取或创建购物车
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // 检查购物车中是否已存在该商品
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // 更新数量
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
    } else {
      // 添加新商品
      await CartItem.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加商品失败',
      error: error.message,
    });
  }
});

// 更新购物车商品数量
router.put('/items/:id', authenticateToken, async (req, res) => {
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

    // 获取购物车项
    const cartItem = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { userId },
        },
        {
          model: Product,
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

    // 验证库存
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '商品库存不足',
      });
    }

    // 更新数量
    await cartItem.update({
      quantity,
      price: cartItem.product.discountPrice || cartItem.product.price,
    });

    res.json({
      success: true,
      message: '数量更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新数量失败',
      error: error.message,
    });
  }
});

// 删除购物车商品
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 获取购物车项
    const cartItem = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
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

    // 删除商品
    await cartItem.destroy();

    res.json({
      success: true,
      message: '商品已删除',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message,
    });
  }
});

// 清空购物车
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '购物车不存在',
      });
    }

    // 删除所有购物车项
    await CartItem.destroy({ where: { cartId: cart.id } });

    res.json({
      success: true,
      message: '购物车已清空',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '清空购物车失败',
      error: error.message,
    });
  }
});

// 批量删除购物车商品
router.delete('/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的商品',
      });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '购物车不存在',
      });
    }

    // 批量删除商品
    await CartItem.destroy({
      where: {
        id: itemIds,
        cartId: cart.id,
      },
    });

    res.json({
      success: true,
      message: '商品已删除',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message,
    });
  }
});

// 获取购物车商品数量
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.json({
        success: true,
        data: { count: 0 },
      });
    }

    const count = await CartItem.count({ where: { cartId: cart.id } });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取购物车数量失败',
      error: error.message,
    });
  }
});

export default router; 