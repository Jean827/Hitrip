import UserBehavior from '../models/UserBehavior';
import Product from '../models/Product';
import UserSimilarity from '../models/UserSimilarity';
import ItemSimilarity from '../models/ItemSimilarity';
import { Op, sequelize } from 'sequelize';
import { redis } from '../config/database';

class CollaborativeFiltering {
  private static readonly CACHE_TTL = 3600; // 1小时缓存
  private static readonly SIMILARITY_THRESHOLD = 0.1;
  private static readonly MAX_RECOMMENDATIONS = 50;

  /**
   * 获取基于用户的推荐
   */
  static async getUserBasedRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // 检查缓存
      const cacheKey = `user_recommendations:${userId}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 获取用户行为数据
      const userBehaviors = await UserBehavior.findAll({
        where: { userId },
        attributes: ['productId', 'behaviorType', 'timestamp'],
        order: [['timestamp', 'DESC']]
      });

      if (userBehaviors.length === 0) {
        return [];
      }

      // 计算用户相似度
      const similarUsers = await this.findSimilarUsers(userId, userBehaviors);
      
      if (similarUsers.length === 0) {
        return [];
      }

      // 获取相似用户的行为数据
      const similarUserIds = similarUsers.map(u => u.userId);
      const similarUserBehaviors = await UserBehavior.findAll({
        where: {
          userId: { [Op.in]: similarUserIds },
          behaviorType: { [Op.in]: ['view', 'purchase', 'add_to_cart'] }
        },
        attributes: ['userId', 'productId', 'behaviorType', 'timestamp'],
        order: [['timestamp', 'DESC']]
      });

      // 计算推荐分数
      const recommendations = this.calculateRecommendationScores(
        userId,
        userBehaviors,
        similarUsers,
        similarUserBehaviors
      );

      // 过滤已购买的商品
      const purchasedProducts = userBehaviors
        .filter(b => b.behaviorType === 'purchase')
        .map(b => b.productId);

      const filteredRecommendations = recommendations
        .filter(rec => !purchasedProducts.includes(rec.productId))
        .slice(0, limit);

      // 缓存结果
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(filteredRecommendations));

      return filteredRecommendations;
    } catch (error) {
      console.error('获取基于用户的推荐失败:', error);
      return [];
    }
  }

  /**
   * 获取基于商品的推荐
   */
  static async getItemBasedRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // 检查缓存
      const cacheKey = `item_recommendations:${userId}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 获取用户最近的行为
      const userBehaviors = await UserBehavior.findAll({
        where: { userId },
        attributes: ['productId', 'behaviorType', 'timestamp'],
        order: [['timestamp', 'DESC']],
        limit: 20
      });

      if (userBehaviors.length === 0) {
        return [];
      }

      // 获取用户感兴趣的商品
      const interestedProducts = userBehaviors
        .filter(b => ['view', 'purchase', 'add_to_cart'].includes(b.behaviorType))
        .map(b => b.productId);

      if (interestedProducts.length === 0) {
        return [];
      }

      // 获取相似商品
      const similarItems = await ItemSimilarity.findAll({
        where: {
          [Op.or]: [
            { productId1: { [Op.in]: interestedProducts } },
            { productId2: { [Op.in]: interestedProducts } }
          ],
          similarity: { [Op.gt]: this.SIMILARITY_THRESHOLD }
        },
        order: [['similarity', 'DESC']],
        limit: this.MAX_RECOMMENDATIONS
      });

      // 计算推荐分数
      const recommendations = this.calculateItemBasedScores(
        userId,
        userBehaviors,
        similarItems,
        interestedProducts
      );

      // 过滤已购买的商品
      const purchasedProducts = userBehaviors
        .filter(b => b.behaviorType === 'purchase')
        .map(b => b.productId);

      const filteredRecommendations = recommendations
        .filter(rec => !purchasedProducts.includes(rec.productId))
        .slice(0, limit);

      // 缓存结果
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(filteredRecommendations));

      return filteredRecommendations;
    } catch (error) {
      console.error('获取基于商品的推荐失败:', error);
      return [];
    }
  }

  /**
   * 获取混合推荐
   */
  static async getHybridRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // 检查缓存
      const cacheKey = `hybrid_recommendations:${userId}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 并行获取两种推荐
      const [userBased, itemBased] = await Promise.all([
        this.getUserBasedRecommendations(userId, limit * 2),
        this.getItemBasedRecommendations(userId, limit * 2)
      ]);

      // 合并推荐结果
      const hybridRecommendations = this.mergeRecommendations(userBased, itemBased, limit);

      // 缓存结果
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(hybridRecommendations));

      return hybridRecommendations;
    } catch (error) {
      console.error('获取混合推荐失败:', error);
      return [];
    }
  }

  /**
   * 计算用户相似度
   */
  static async calculateUserSimilarity(userId1: number, userId2: number): Promise<number> {
    try {
      // 检查缓存
      const cacheKey = `user_similarity:${userId1}:${userId2}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return parseFloat(cached);
      }

      // 获取两个用户的行为数据
      const [user1Behaviors, user2Behaviors] = await Promise.all([
        UserBehavior.findAll({
          where: { userId: userId1 },
          attributes: ['productId', 'behaviorType']
        }),
        UserBehavior.findAll({
          where: { userId: userId2 },
          attributes: ['productId', 'behaviorType']
        })
      ]);

      if (user1Behaviors.length === 0 || user2Behaviors.length === 0) {
        return 0;
      }

      // 计算Jaccard相似度
      const user1Products = new Set(user1Behaviors.map(b => b.productId));
      const user2Products = new Set(user2Behaviors.map(b => b.productId));

      const intersection = new Set([...user1Products].filter(x => user2Products.has(x)));
      const union = new Set([...user1Products, ...user2Products]);

      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      // 缓存结果
      await redis.setex(cacheKey, this.CACHE_TTL, similarity.toString());

      return similarity;
    } catch (error) {
      console.error('计算用户相似度失败:', error);
      return 0;
    }
  }

  /**
   * 计算商品相似度
   */
  static async calculateItemSimilarity(productId1: number, productId2: number): Promise<number> {
    try {
      // 检查缓存
      const cacheKey = `item_similarity:${productId1}:${productId2}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return parseFloat(cached);
      }

      // 获取两个商品的行为数据
      const [product1Behaviors, product2Behaviors] = await Promise.all([
        UserBehavior.findAll({
          where: { productId: productId1 },
          attributes: ['userId', 'behaviorType']
        }),
        UserBehavior.findAll({
          where: { productId: productId2 },
          attributes: ['userId', 'behaviorType']
        })
      ]);

      if (product1Behaviors.length === 0 || product2Behaviors.length === 0) {
        return 0;
      }

      // 计算余弦相似度
      const product1Users = new Set(product1Behaviors.map(b => b.userId));
      const product2Users = new Set(product2Behaviors.map(b => b.userId));

      const intersection = new Set([...product1Users].filter(x => product2Users.has(x)));
      const similarity = Math.sqrt(product1Users.size * product2Users.size) > 0 ? 
        intersection.size / Math.sqrt(product1Users.size * product2Users.size) : 0;

      // 缓存结果
      await redis.setex(cacheKey, this.CACHE_TTL, similarity.toString());

      return similarity;
    } catch (error) {
      console.error('计算商品相似度失败:', error);
      return 0;
    }
  }

  /**
   * 实时更新推荐
   */
  static async updateRecommendations(userId: number, productId: number, behaviorType: string): Promise<void> {
    try {
      // 清除相关缓存
      const cacheKeys = [
        `user_recommendations:${userId}:*`,
        `item_recommendations:${userId}:*`,
        `hybrid_recommendations:${userId}:*`
      ];

      for (const pattern of cacheKeys) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }

      // 异步更新相似度
      this.updateSimilarities(userId, productId, behaviorType);
    } catch (error) {
      console.error('更新推荐失败:', error);
    }
  }

  /**
   * 查找相似用户
   */
  private static async findSimilarUsers(userId: number, userBehaviors: any[]): Promise<any[]> {
    try {
      // 获取所有用户的行为数据
      const allUsers = await UserBehavior.findAll({
        attributes: ['userId'],
        group: ['userId'],
        having: sequelize.literal('COUNT(*) > 5') // 只考虑有足够行为的用户
      });

      const similarUsers = [];
      const userProducts = new Set(userBehaviors.map(b => b.productId));

      for (const user of allUsers) {
        if (user.userId === userId) continue;

        const otherUserBehaviors = await UserBehavior.findAll({
          where: { userId: user.userId },
          attributes: ['productId']
        });

        const otherUserProducts = new Set(otherUserBehaviors.map(b => b.productId));
        const intersection = new Set([...userProducts].filter(x => otherUserProducts.has(x)));
        const union = new Set([...userProducts, ...otherUserProducts]);

        const similarity = union.size > 0 ? intersection.size / union.size : 0;

        if (similarity > this.SIMILARITY_THRESHOLD) {
          similarUsers.push({
            userId: user.userId,
            similarity
          });
        }
      }

      return similarUsers.sort((a, b) => b.similarity - a.similarity).slice(0, 20);
    } catch (error) {
      console.error('查找相似用户失败:', error);
      return [];
    }
  }

  /**
   * 计算推荐分数
   */
  private static calculateRecommendationScores(
    userId: number,
    userBehaviors: any[],
    similarUsers: any[],
    similarUserBehaviors: any[]
  ): any[] {
    const scores = new Map<number, number>();
    const userProductSet = new Set(userBehaviors.map(b => b.productId));

    for (const behavior of similarUserBehaviors) {
      if (userProductSet.has(behavior.productId)) continue;

      const similarUser = similarUsers.find(u => u.userId === behavior.userId);
      if (!similarUser) continue;

      const weight = this.getBehaviorWeight(behavior.behaviorType);
      const score = similarUser.similarity * weight;

      if (scores.has(behavior.productId)) {
        scores.set(behavior.productId, scores.get(behavior.productId)! + score);
      } else {
        scores.set(behavior.productId, score);
      }
    }

    return Array.from(scores.entries())
      .map(([productId, score]) => ({
        productId,
        score,
        reason: `基于相似用户推荐，相似度: ${(score * 100).toFixed(1)}%`
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 计算基于商品的推荐分数
   */
  private static calculateItemBasedScores(
    userId: number,
    userBehaviors: any[],
    similarItems: any[],
    interestedProducts: number[]
  ): any[] {
    const scores = new Map<number, number>();
    const userProductSet = new Set(userBehaviors.map(b => b.productId));

    for (const item of similarItems) {
      const similarProductId = item.productId1 === interestedProducts[0] ? 
        item.productId2 : item.productId1;

      if (userProductSet.has(similarProductId)) continue;

      const score = item.similarity;
      if (scores.has(similarProductId)) {
        scores.set(similarProductId, scores.get(similarProductId)! + score);
      } else {
        scores.set(similarProductId, score);
      }
    }

    return Array.from(scores.entries())
      .map(([productId, score]) => ({
        productId,
        score,
        reason: `基于商品相似度推荐，相似度: ${(score * 100).toFixed(1)}%`
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 合并推荐结果
   */
  private static mergeRecommendations(userBased: any[], itemBased: any[], limit: number): any[] {
    const merged = new Map<number, any>();

    // 合并用户推荐
    for (const rec of userBased) {
      merged.set(rec.productId, {
        ...rec,
        score: rec.score * 0.6 // 用户推荐权重
      });
    }

    // 合并商品推荐
    for (const rec of itemBased) {
      if (merged.has(rec.productId)) {
        merged.get(rec.productId).score += rec.score * 0.4; // 商品推荐权重
      } else {
        merged.set(rec.productId, {
          ...rec,
          score: rec.score * 0.4
        });
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 获取行为权重
   */
  private static getBehaviorWeight(behaviorType: string): number {
    switch (behaviorType) {
      case 'purchase':
        return 1.0;
      case 'add_to_cart':
        return 0.8;
      case 'view':
        return 0.5;
      default:
        return 0.3;
    }
  }

  /**
   * 异步更新相似度
   */
  private static async updateSimilarities(userId: number, productId: number, behaviorType: string): Promise<void> {
    try {
      // 更新用户相似度
      const allUsers = await UserBehavior.findAll({
        attributes: ['userId'],
        group: ['userId'],
        having: sequelize.literal('COUNT(*) > 5')
      });

      for (const user of allUsers) {
        if (user.userId === userId) continue;
        const similarity = await this.calculateUserSimilarity(userId, user.userId);
        
        await UserSimilarity.upsert({
          userId1: Math.min(userId, user.userId),
          userId2: Math.max(userId, user.userId),
          similarity
        });
      }

      // 更新商品相似度
      const allProducts = await UserBehavior.findAll({
        attributes: ['productId'],
        group: ['productId'],
        having: sequelize.literal('COUNT(*) > 3')
      });

      for (const product of allProducts) {
        if (product.productId === productId) continue;
        const similarity = await this.calculateItemSimilarity(productId, product.productId);
        
        await ItemSimilarity.upsert({
          productId1: Math.min(productId, product.productId),
          productId2: Math.max(productId, product.productId),
          similarity
        });
      }
    } catch (error) {
      console.error('更新相似度失败:', error);
    }
  }
}

export default CollaborativeFiltering; 