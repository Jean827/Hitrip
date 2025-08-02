import express from 'express';
import { authenticateToken } from '../middleware/auth';
import CollaborativeFiltering from '../utils/collaborativeFiltering';
import UserBehavior from '../models/UserBehavior';
import Recommendation from '../models/Recommendation';
import Product from '../models/Product';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * 获取个性化推荐
 */
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { type = 'hybrid', limit = 10 } = req.query;

    let recommendations;
    switch (type) {
      case 'user-based':
        recommendations = await CollaborativeFiltering.getUserBasedRecommendations(userId, Number(limit));
        break;
      case 'item-based':
        recommendations = await CollaborativeFiltering.getItemBasedRecommendations(userId, Number(limit));
        break;
      case 'hybrid':
      default:
        recommendations = await CollaborativeFiltering.getHybridRecommendations(userId, Number(limit));
        break;
    }

    // 获取推荐商品的详细信息
    const productIds = recommendations.map(r => r.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      include: [
        {
          model: require('../models/Category').default,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    // 合并推荐结果和商品信息
    const result = recommendations.map(rec => {
      const product = products.find(p => p.id === rec.productId);
      return {
        ...rec,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        } : null,
      };
    }).filter(item => item.product !== null);

    // 保存推荐结果到数据库
    await Promise.all(
      result.map(rec =>
        Recommendation.upsert({
          userId,
          productId: rec.productId,
          score: rec.score,
          recommendationType: type as any,
          reason: rec.reason,
          isDisplayed: true,
        })
      )
    );

    res.json({
      success: true,
      data: result,
      type,
      count: result.length,
    });
  } catch (error) {
    console.error('获取个性化推荐失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 获取热门推荐
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, categoryId } = req.query;

    let whereClause: any = {
      behaviorType: 'purchase',
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const popularProducts = await UserBehavior.findAll({
      where: whereClause,
      attributes: [
        'productId',
        [require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'purchaseCount'],
      ],
      group: ['productId'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'DESC']],
      limit: Number(limit),
    });

    const productIds = popularProducts.map((p: any) => p.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      include: [
        {
          model: require('../models/Category').default,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    const result = popularProducts.map((popular: any) => {
      const product = products.find(p => p.id === popular.productId);
      return {
        productId: popular.productId,
        score: 0.5,
        reason: `热门商品，已购买${popular.dataValues.purchaseCount}次`,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        } : null,
      };
    }).filter(item => item.product !== null);

    res.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error('获取热门推荐失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门推荐失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 获取相似商品推荐
 */
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10 } = req.query;

    // 获取相似商品
    const similarItems = await require('../models/ItemSimilarity').default.findAll({
      where: {
        [Op.or]: [
          { productId1: productId },
          { productId2: productId },
        ],
        similarity: { [Op.gt]: 0.1 },
      },
      order: [['similarity', 'DESC']],
      limit: Number(limit),
    });

    const similarProductIds = similarItems.map(item => 
      item.productId1 === parseInt(productId) ? item.productId2 : item.productId1
    );

    const products = await Product.findAll({
      where: { id: { [Op.in]: similarProductIds } },
      include: [
        {
          model: require('../models/Category').default,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    const result = similarItems.map(item => {
      const similarProductId = item.productId1 === parseInt(productId) ? item.productId2 : item.productId1;
      const product = products.find(p => p.id === similarProductId);
      return {
        productId: similarProductId,
        score: item.similarity,
        reason: `与当前商品相似度${(item.similarity * 100).toFixed(1)}%`,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        } : null,
      };
    }).filter(item => item.product !== null);

    res.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error('获取相似商品推荐失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相似商品推荐失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 记录用户行为
 */
router.post('/behavior', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { productId, behaviorType, behaviorData, sessionId, userAgent, ipAddress, referrer } = req.body;

    if (!productId || !behaviorType) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    // 获取商品分类信息
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在',
      });
    }

    // 记录用户行为
    await UserBehavior.create({
      userId,
      productId,
      categoryId: product.categoryId,
      behaviorType,
      behaviorData,
      sessionId,
      userAgent,
      ipAddress,
      referrer,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: '行为记录成功',
    });
  } catch (error) {
    console.error('记录用户行为失败:', error);
    res.status(500).json({
      success: false,
      message: '记录行为失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 记录推荐点击
 */
router.post('/click', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { productId, recommendationType } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '缺少商品ID',
      });
    }

    // 更新推荐记录
    await Recommendation.update(
      { isClicked: true },
      {
        where: {
          userId,
          productId,
          recommendationType: recommendationType || 'hybrid',
        },
      }
    );

    res.json({
      success: true,
      message: '点击记录成功',
    });
  } catch (error) {
    console.error('记录推荐点击失败:', error);
    res.status(500).json({
      success: false,
      message: '记录点击失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 记录推荐购买
 */
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { productId, recommendationType } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '缺少商品ID',
      });
    }

    // 更新推荐记录
    await Recommendation.update(
      { isPurchased: true },
      {
        where: {
          userId,
          productId,
          recommendationType: recommendationType || 'hybrid',
        },
      }
    );

    res.json({
      success: true,
      message: '购买记录成功',
    });
  } catch (error) {
    console.error('记录推荐购买失败:', error);
    res.status(500).json({
      success: false,
      message: '记录购买失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 获取推荐效果统计
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate } = req.query;

    let whereClause: any = { userId };
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const recommendations = await Recommendation.findAll({
      where: whereClause,
      attributes: [
        'recommendationType',
        'isDisplayed',
        'isClicked',
        'isPurchased',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
      ],
      group: ['recommendationType', 'isDisplayed', 'isClicked', 'isPurchased'],
    });

    const stats = {
      total: 0,
      displayed: 0,
      clicked: 0,
      purchased: 0,
      clickRate: 0,
      purchaseRate: 0,
      byType: {} as any,
    };

    recommendations.forEach((rec: any) => {
      const count = parseInt(rec.dataValues.total);
      const type = rec.recommendationType;
      const isDisplayed = rec.isDisplayed;
      const isClicked = rec.isClicked;
      const isPurchased = rec.isPurchased;

      stats.total += count;
      if (isDisplayed) stats.displayed += count;
      if (isClicked) stats.clicked += count;
      if (isPurchased) stats.purchased += count;

      if (!stats.byType[type]) {
        stats.byType[type] = { total: 0, displayed: 0, clicked: 0, purchased: 0 };
      }
      stats.byType[type].total += count;
      if (isDisplayed) stats.byType[type].displayed += count;
      if (isClicked) stats.byType[type].clicked += count;
      if (isPurchased) stats.byType[type].purchased += count;
    });

    if (stats.displayed > 0) {
      stats.clickRate = (stats.clicked / stats.displayed) * 100;
      stats.purchaseRate = (stats.purchased / stats.displayed) * 100;
    }

    // 计算各类型的转化率
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      if (typeStats.displayed > 0) {
        typeStats.clickRate = (typeStats.clicked / typeStats.displayed) * 100;
        typeStats.purchaseRate = (typeStats.purchased / typeStats.displayed) * 100;
      }
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取推荐统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 获取推荐效果评估
 */
router.get('/evaluation', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { startDate, endDate, metrics = ['click_rate', 'purchase_rate', 'diversity', 'novelty'] } = req.query;

    let whereClause: any = { userId };
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const recommendations = await Recommendation.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'categoryId', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const evaluation = {
      accuracy: 0,
      diversity: 0,
      novelty: 0,
      coverage: 0,
      serendipity: 0,
      metrics: {} as any
    };

    // 计算准确率 (点击率 + 购买率)
    const totalDisplayed = recommendations.filter(r => r.isDisplayed).length;
    const totalClicked = recommendations.filter(r => r.isClicked).length;
    const totalPurchased = recommendations.filter(r => r.isPurchased).length;

    if (totalDisplayed > 0) {
      evaluation.accuracy = ((totalClicked + totalPurchased) / totalDisplayed) * 100;
    }

    // 计算多样性 (推荐商品的类别分布)
    const recommendedProducts = recommendations.filter(r => r.isDisplayed);
    const categoryCounts = new Map<number, number>();
    
    recommendedProducts.forEach(rec => {
      if (rec.product && rec.product.categoryId) {
        const categoryId = rec.product.categoryId;
        categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
      }
    });

    const uniqueCategories = categoryCounts.size;
    const totalRecommendations = recommendedProducts.length;
    evaluation.diversity = totalRecommendations > 0 ? (uniqueCategories / totalRecommendations) * 100 : 0;

    // 计算新颖性 (推荐商品的流行度)
    const productIds = recommendedProducts.map(r => r.productId);
    const popularProducts = await UserBehavior.findAll({
      where: {
        productId: { [Op.in]: productIds },
        behaviorType: 'purchase'
      },
      attributes: [
        'productId',
        [require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'purchaseCount']
      ],
      group: ['productId'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('productId')), 'DESC']]
    });

    const popularProductIds = new Set(popularProducts.slice(0, 10).map(p => p.productId));
    const novelRecommendations = recommendedProducts.filter(r => !popularProductIds.has(r.productId));
    evaluation.novelty = totalRecommendations > 0 ? (novelRecommendations.length / totalRecommendations) * 100 : 0;

    // 计算覆盖率 (推荐商品占所有商品的比例)
    const totalProducts = await Product.count();
    const recommendedProductIds = new Set(recommendedProducts.map(r => r.productId));
    evaluation.coverage = totalProducts > 0 ? (recommendedProductIds.size / totalProducts) * 100 : 0;

    // 计算意外性 (用户历史行为之外的推荐)
    const userBehaviors = await UserBehavior.findAll({
      where: { userId },
      attributes: ['productId']
    });
    const userProductIds = new Set(userBehaviors.map(b => b.productId));
    const serendipitousRecommendations = recommendedProducts.filter(r => !userProductIds.has(r.productId));
    evaluation.serendipity = totalRecommendations > 0 ? (serendipitousRecommendations.length / totalRecommendations) * 100 : 0;

    // 计算详细指标
    const metricsArray = Array.isArray(metrics) ? metrics : [metrics as string];
    
    metricsArray.forEach(metric => {
      switch (metric) {
        case 'click_rate':
          evaluation.metrics.clickRate = totalDisplayed > 0 ? (totalClicked / totalDisplayed) * 100 : 0;
          break;
        case 'purchase_rate':
          evaluation.metrics.purchaseRate = totalDisplayed > 0 ? (totalPurchased / totalDisplayed) * 100 : 0;
          break;
        case 'diversity':
          evaluation.metrics.diversity = evaluation.diversity;
          break;
        case 'novelty':
          evaluation.metrics.novelty = evaluation.novelty;
          break;
        case 'coverage':
          evaluation.metrics.coverage = evaluation.coverage;
          break;
        case 'serendipity':
          evaluation.metrics.serendipity = evaluation.serendipity;
          break;
      }
    });

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error('获取推荐效果评估失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评估失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * A/B测试框架
 */
router.post('/ab-test', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { testName, variant, recommendationType, productIds } = req.body;

    if (!testName || !variant || !recommendationType || !productIds) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    // 记录A/B测试数据
    const testRecord = await require('../models/ABTest').default.create({
      userId,
      testName,
      variant,
      recommendationType,
      productIds: JSON.stringify(productIds),
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: testRecord,
    });
  } catch (error) {
    console.error('记录A/B测试失败:', error);
    res.status(500).json({
      success: false,
      message: '记录A/B测试失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 获取A/B测试结果
 */
router.get('/ab-test-results', authenticateToken, async (req, res) => {
  try {
    const { testName, startDate, endDate } = req.query;

    let whereClause: any = {};
    if (testName) {
      whereClause.testName = testName;
    }
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const testResults = await require('../models/ABTest').default.findAll({
      where: whereClause,
      attributes: [
        'testName',
        'variant',
        'recommendationType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'impressions'],
        [require('sequelize').fn('COUNT', require('sequelize').col('clicks')), 'clicks'],
        [require('sequelize').fn('COUNT', require('sequelize').col('purchases')), 'purchases']
      ],
      group: ['testName', 'variant', 'recommendationType']
    });

    // 计算转化率
    const results = testResults.map((result: any) => {
      const impressions = parseInt(result.dataValues.impressions);
      const clicks = parseInt(result.dataValues.clicks);
      const purchases = parseInt(result.dataValues.purchases);

      return {
        testName: result.testName,
        variant: result.variant,
        recommendationType: result.recommendationType,
        impressions,
        clicks,
        purchases,
        clickRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
        purchaseRate: impressions > 0 ? (purchases / impressions) * 100 : 0,
        conversionRate: clicks > 0 ? (purchases / clicks) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('获取A/B测试结果失败:', error);
    res.status(500).json({
      success: false,
      message: '获取A/B测试结果失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 记录推荐点击 (A/B测试)
 */
router.post('/ab-click', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { testName, variant, productId } = req.body;

    if (!testName || !variant || !productId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    // 更新A/B测试记录
    await require('../models/ABTest').default.update(
      { clicks: true },
      {
        where: {
          userId,
          testName,
          variant,
          productIds: { [Op.like]: `%${productId}%` }
        }
      }
    );

    res.json({
      success: true,
      message: '点击记录成功',
    });
  } catch (error) {
    console.error('记录A/B测试点击失败:', error);
    res.status(500).json({
      success: false,
      message: '记录点击失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 记录推荐购买 (A/B测试)
 */
router.post('/ab-purchase', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { testName, variant, productId } = req.body;

    if (!testName || !variant || !productId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    // 更新A/B测试记录
    await require('../models/ABTest').default.update(
      { purchases: true },
      {
        where: {
          userId,
          testName,
          variant,
          productIds: { [Op.like]: `%${productId}%` }
        }
      }
    );

    res.json({
      success: true,
      message: '购买记录成功',
    });
  } catch (error) {
    console.error('记录A/B测试购买失败:', error);
    res.status(500).json({
      success: false,
      message: '记录购买失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 计算用户相似度
 */
router.post('/calculate-similarity', authenticateToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID',
      });
    }

    const similarity = await CollaborativeFiltering.calculateUserSimilarity(userId1, userId2);

    res.json({
      success: true,
      data: {
        userId1,
        userId2,
        similarity,
      },
    });
  } catch (error) {
    console.error('计算用户相似度失败:', error);
    res.status(500).json({
      success: false,
      message: '计算相似度失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 计算商品相似度
 */
router.post('/calculate-item-similarity', authenticateToken, async (req, res) => {
  try {
    const { productId1, productId2 } = req.body;

    if (!productId1 || !productId2) {
      return res.status(400).json({
        success: false,
        message: '缺少商品ID',
      });
    }

    const similarity = await CollaborativeFiltering.calculateItemSimilarity(productId1, productId2);

    res.json({
      success: true,
      data: {
        productId1,
        productId2,
        similarity,
      },
    });
  } catch (error) {
    console.error('计算商品相似度失败:', error);
    res.status(500).json({
      success: false,
      message: '计算相似度失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router; 