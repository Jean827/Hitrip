import Category from '../models/Category';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import { logger } from './logger';

// 海南特色商品分类数据
const categories = [
  {
    name: '热带水果',
    description: '海南特色热带水果，新鲜美味',
    icon: '🍍',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400',
    level: 1,
    sortOrder: 1,
  },
  {
    name: '海鲜特产',
    description: '海南新鲜海鲜，营养丰富',
    icon: '🦐',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    level: 1,
    sortOrder: 2,
  },
  {
    name: '茶叶咖啡',
    description: '海南特色茶叶和咖啡',
    icon: '☕',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    level: 1,
    sortOrder: 3,
  },
  {
    name: '手工艺品',
    description: '海南传统手工艺品',
    icon: '🎨',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    level: 1,
    sortOrder: 4,
  },
  {
    name: '椰子制品',
    description: '海南椰子相关产品',
    icon: '🥥',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    level: 1,
    sortOrder: 5,
  },
];

// 商品数据
const products = [
  // 热带水果
  {
    name: '海南芒果',
    description: '海南特产芒果，香甜可口，营养丰富。富含维生素C和胡萝卜素，是夏季解暑的佳品。',
    categoryName: '热带水果',
    price: 25.00,
    originalPrice: 30.00,
    discountPrice: 22.00,
    memberPrice: 20.00,
    images: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
    ],
    tags: ['新鲜', '无添加', '营养丰富'],
    stock: 100,
    weight: 0.5,
    brand: '海南特产',
    model: '金煌芒果',
    warranty: '7天无理由退换',
  },
  {
    name: '海南菠萝',
    description: '海南特产菠萝，酸甜可口，富含维生素和矿物质。',
    categoryName: '热带水果',
    price: 15.00,
    originalPrice: 18.00,
    images: [
      'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400',
    ],
    tags: ['新鲜', '酸甜可口'],
    stock: 80,
    weight: 1.0,
    brand: '海南特产',
    model: '金钻菠萝',
    warranty: '7天无理由退换',
  },
  {
    name: '海南香蕉',
    description: '海南特产香蕉，香甜软糯，营养丰富。',
    categoryName: '热带水果',
    price: 8.00,
    originalPrice: 10.00,
    images: [
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400',
    ],
    tags: ['新鲜', '软糯'],
    stock: 150,
    weight: 0.3,
    brand: '海南特产',
    model: '皇帝蕉',
    warranty: '7天无理由退换',
  },

  // 海鲜特产
  {
    name: '海南大虾',
    description: '海南新鲜大虾，肉质鲜美，营养丰富。富含优质蛋白质和多种矿物质。',
    categoryName: '海鲜特产',
    price: 68.00,
    originalPrice: 80.00,
    discountPrice: 60.00,
    images: [
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    ],
    tags: ['新鲜', '营养丰富', '优质蛋白'],
    stock: 50,
    weight: 0.5,
    brand: '海南海鲜',
    model: '基围虾',
    warranty: '24小时新鲜保证',
  },
  {
    name: '海南石斑鱼',
    description: '海南特产石斑鱼，肉质细嫩，味道鲜美。',
    categoryName: '海鲜特产',
    price: 120.00,
    originalPrice: 150.00,
    images: [
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    ],
    tags: ['新鲜', '细嫩'],
    stock: 30,
    weight: 1.0,
    brand: '海南海鲜',
    model: '青石斑',
    warranty: '24小时新鲜保证',
  },

  // 茶叶咖啡
  {
    name: '海南咖啡',
    description: '海南特产咖啡，香气浓郁，口感醇厚。采用传统工艺烘焙，保留咖啡的原始风味。',
    categoryName: '茶叶咖啡',
    price: 45.00,
    originalPrice: 55.00,
    discountPrice: 40.00,
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    ],
    tags: ['香气浓郁', '醇厚', '传统工艺'],
    stock: 60,
    weight: 0.25,
    brand: '海南咖啡',
    model: '罗布斯塔',
    warranty: '30天无理由退换',
  },
  {
    name: '海南绿茶',
    description: '海南特产绿茶，清香怡人，回甘持久。',
    categoryName: '茶叶咖啡',
    price: 35.00,
    originalPrice: 40.00,
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    ],
    tags: ['清香', '回甘'],
    stock: 70,
    weight: 0.1,
    brand: '海南茶叶',
    model: '五指山绿茶',
    warranty: '30天无理由退换',
  },

  // 手工艺品
  {
    name: '海南黎锦',
    description: '海南黎族传统手工艺品，图案精美，色彩艳丽。采用传统手工编织工艺制作。',
    categoryName: '手工艺品',
    price: 280.00,
    originalPrice: 350.00,
    discountPrice: 250.00,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ],
    tags: ['传统工艺', '手工制作', '精美图案'],
    stock: 20,
    weight: 0.5,
    brand: '黎族工艺',
    model: '传统黎锦',
    warranty: '7天无理由退换',
  },
  {
    name: '海南椰雕',
    description: '海南特色椰雕工艺品，造型独特，工艺精湛。',
    categoryName: '手工艺品',
    price: 150.00,
    originalPrice: 180.00,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ],
    tags: ['手工制作', '造型独特'],
    stock: 25,
    weight: 0.3,
    brand: '海南工艺',
    model: '椰雕摆件',
    warranty: '7天无理由退换',
  },

  // 椰子制品
  {
    name: '海南椰子油',
    description: '海南特产椰子油，纯天然提取，营养丰富。可用于烹饪和护肤。',
    categoryName: '椰子制品',
    price: 88.00,
    originalPrice: 100.00,
    discountPrice: 80.00,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    ],
    tags: ['纯天然', '营养丰富', '多功能'],
    stock: 40,
    weight: 0.5,
    brand: '海南椰子',
    model: '冷压椰子油',
    warranty: '30天无理由退换',
  },
  {
    name: '海南椰奶',
    description: '海南特产椰奶，香甜浓郁，营养丰富。',
    categoryName: '椰子制品',
    price: 25.00,
    originalPrice: 30.00,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    ],
    tags: ['香甜', '浓郁'],
    stock: 60,
    weight: 1.0,
    brand: '海南椰子',
    model: '纯椰奶',
    warranty: '7天无理由退换',
  },
];

// 初始化分类数据
export async function seedCategories() {
  try {
    logger.info('开始初始化分类数据...');
    
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        await Category.create(categoryData);
        logger.info(`创建分类: ${categoryData.name}`);
      }
    }

    logger.info('分类数据初始化完成');
  } catch (error) {
    logger.error('初始化分类数据失败:', error);
    throw error;
  }
}

// 初始化商品数据
export async function seedProducts() {
  try {
    logger.info('开始初始化商品数据...');
    
    for (const productData of products) {
      // 查找分类
      const category = await Category.findOne({
        where: { name: productData.categoryName }
      });

      if (!category) {
        logger.warn(`分类不存在: ${productData.categoryName}`);
        continue;
      }

      // 检查商品是否已存在
      const existingProduct = await Product.findOne({
        where: { name: productData.name }
      });

      if (!existingProduct) {
        // 创建商品
        const product = await Product.create({
          ...productData,
          categoryId: category.id,
          salesCount: Math.floor(Math.random() * 100),
          rating: 4.0 + Math.random() * 1.0,
          reviewCount: Math.floor(Math.random() * 50),
        });

        // 创建库存记录
        await Inventory.create({
          productId: product.id,
          quantity: productData.stock,
          availableQuantity: productData.stock,
          lowStockThreshold: 10,
          maxStock: 1000,
        });

        logger.info(`创建商品: ${productData.name}`);
      }
    }

    logger.info('商品数据初始化完成');
  } catch (error) {
    logger.error('初始化商品数据失败:', error);
    throw error;
  }
}

// 初始化所有数据
export async function seedAllData() {
  try {
    logger.info('开始初始化商城数据...');
    
    await seedCategories();
    await seedProducts();
    
    logger.info('商城数据初始化完成');
  } catch (error) {
    logger.error('初始化商城数据失败:', error);
    throw error;
  }
} 