import { Op } from 'sequelize';
import UserBehavior from '../models/UserBehavior';
import UserProfile from '../models/UserProfile';
import UserPreference from '../models/UserPreference';
import Product from '../models/Product';
import Category from '../models/Category';

interface InterestTag {
  category: string;
  score: number;
  frequency: number;
}

interface BehaviorPattern {
  patternType: string;
  frequency: number;
  timeSlot: string;
  context: any;
}

interface UserValueMetrics {
  totalPurchases: number;
  totalSpent: number;
  avgOrderValue: number;
  purchaseFrequency: number;
  lastPurchaseDate: Date | null;
  engagementScore: number;
}

export class UserProfileAnalysis {
  /**
   * 分析用户兴趣标签
   */
  static async analyzeUserInterests(userId: string): Promise<InterestTag[]> {
    try {
      // 获取用户行为数据
      const behaviors = await UserBehavior.findAll({
        where: {
          userId,
          targetType: 'product',
        },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
        order: [['timestamp', 'DESC']],
      });

      // 统计分类偏好
      const categoryStats: { [categoryId: string]: { score: number; frequency: number } } = {};
      
      behaviors.forEach(behavior => {
        const categoryId = behavior.product?.category?.id;
        if (!categoryId) return;

        const behaviorScore = this.getBehaviorScore(behavior.behaviorType);
        
        if (categoryStats[categoryId]) {
          categoryStats[categoryId].score += behaviorScore;
          categoryStats[categoryId].frequency += 1;
        } else {
          categoryStats[categoryId] = {
            score: behaviorScore,
            frequency: 1,
          };
        }
      });

      // 转换为兴趣标签
      const interests: InterestTag[] = Object.entries(categoryStats)
        .map(([categoryId, stats]) => ({
          category: categoryId,
          score: Math.min(1, stats.score / 10), // 归一化到0-1
          frequency: stats.frequency,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // 取前10个兴趣标签

      return interests;
    } catch (error) {
      console.error('分析用户兴趣失败:', error);
      return [];
    }
  }

  /**
   * 分析用户行为模式
   */
  static async analyzeBehaviorPatterns(userId: string): Promise<BehaviorPattern[]> {
    try {
      // 获取用户行为数据
      const behaviors = await UserBehavior.findAll({
        where: { userId },
        order: [['timestamp', 'ASC']],
      });

      const patterns: { [key: string]: BehaviorPattern } = {};

      // 分析时间模式
      const timePatterns = this.analyzeTimePatterns(behaviors);
      patterns['time'] = timePatterns;

      // 分析行为序列模式
      const sequencePatterns = this.analyzeSequencePatterns(behaviors);
      patterns['sequence'] = sequencePatterns;

      // 分析页面访问模式
      const pagePatterns = this.analyzePagePatterns(behaviors);
      patterns['page'] = pagePatterns;

      return Object.values(patterns);
    } catch (error) {
      console.error('分析用户行为模式失败:', error);
      return [];
    }
  }

  /**
   * 分析时间模式
   */
  private static analyzeTimePatterns(behaviors: any[]): BehaviorPattern {
    const timeSlots: { [hour: number]: number } = {};
    
    behaviors.forEach(behavior => {
      const hour = new Date(behavior.timestamp).getHours();
      timeSlots[hour] = (timeSlots[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(timeSlots)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      patternType: 'time',
      frequency: mostActiveHour ? mostActiveHour[1] : 0,
      timeSlot: mostActiveHour ? mostActiveHour[0] : 'unknown',
      context: { timeSlots },
    };
  }

  /**
   * 分析行为序列模式
   */
  private static analyzeSequencePatterns(behaviors: any[]): BehaviorPattern {
    const sequences: { [sequence: string]: number } = {};
    
    for (let i = 0; i < behaviors.length - 1; i++) {
      const current = behaviors[i].behaviorType;
      const next = behaviors[i + 1].behaviorType;
      const sequence = `${current}->${next}`;
      
      sequences[sequence] = (sequences[sequence] || 0) + 1;
    }

    const mostCommonSequence = Object.entries(sequences)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      patternType: 'sequence',
      frequency: mostCommonSequence ? mostCommonSequence[1] : 0,
      timeSlot: 'all',
      context: { sequences },
    };
  }

  /**
   * 分析页面访问模式
   */
  private static analyzePagePatterns(behaviors: any[]): BehaviorPattern {
    const pageVisits: { [page: string]: number } = {};
    
    behaviors.forEach(behavior => {
      const page = behavior.targetType;
      pageVisits[page] = (pageVisits[page] || 0) + 1;
    });

    const mostVisitedPage = Object.entries(pageVisits)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      patternType: 'page',
      frequency: mostVisitedPage ? mostVisitedPage[1] : 0,
      timeSlot: 'all',
      context: { pageVisits },
    };
  }

  /**
   * 评估用户价值
   */
  static async evaluateUserValue(userId: string): Promise<UserValueMetrics> {
    try {
      // 获取用户购买行为
      const purchaseBehaviors = await UserBehavior.findAll({
        where: {
          userId,
          behaviorType: 'purchase',
          targetType: 'product',
        },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
          },
        ],
        order: [['timestamp', 'DESC']],
      });

      // 计算购买指标
      const totalPurchases = purchaseBehaviors.length;
      const totalSpent = purchaseBehaviors.reduce((sum, behavior) => {
        return sum + (behavior.product?.price || 0);
      }, 0);
      
      const avgOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
      const lastPurchaseDate = purchaseBehaviors.length > 0 ? purchaseBehaviors[0].timestamp : null;

      // 计算购买频率（最近30天）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPurchases = purchaseBehaviors.filter(
        behavior => behavior.timestamp >= thirtyDaysAgo
      );
      const purchaseFrequency = recentPurchases.length;

      // 计算参与度分数
      const allBehaviors = await UserBehavior.findAll({
        where: { userId },
      });
      
      const engagementScore = this.calculateEngagementScore(allBehaviors);

      return {
        totalPurchases,
        totalSpent,
        avgOrderValue,
        purchaseFrequency,
        lastPurchaseDate,
        engagementScore,
      };
    } catch (error) {
      console.error('评估用户价值失败:', error);
      return {
        totalPurchases: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        purchaseFrequency: 0,
        lastPurchaseDate: null,
        engagementScore: 0,
      };
    }
  }

  /**
   * 计算参与度分数
   */
  private static calculateEngagementScore(behaviors: any[]): number {
    const behaviorWeights: { [key: string]: number } = {
      'view': 1,
      'click': 2,
      'favorite': 3,
      'purchase': 5,
      'share': 2,
      'search': 1,
    };

    const totalScore = behaviors.reduce((sum, behavior) => {
      return sum + (behaviorWeights[behavior.behaviorType] || 0);
    }, 0);

    // 归一化到0-100
    return Math.min(100, totalScore / 10);
  }

  /**
   * 确定用户分群
   */
  static async determineUserSegment(userId: string): Promise<string> {
    try {
      const valueMetrics = await this.evaluateUserValue(userId);
      
      // 基于用户价值和行为确定分群
      if (valueMetrics.totalPurchases === 0) {
        return 'new';
      } else if (valueMetrics.engagementScore >= 80 && valueMetrics.totalSpent >= 1000) {
        return 'vip';
      } else if (valueMetrics.engagementScore >= 50 || valueMetrics.purchaseFrequency >= 3) {
        return 'active';
      } else {
        return 'inactive';
      }
    } catch (error) {
      console.error('确定用户分群失败:', error);
      return 'new';
    }
  }

  /**
   * 更新用户画像
   */
  static async updateUserProfile(userId: string): Promise<void> {
    try {
      console.log(`开始更新用户 ${userId} 的画像...`);

      // 分析用户兴趣
      const interests = await this.analyzeUserInterests(userId);
      const interestTags = interests.map(interest => interest.category);

      // 分析行为模式
      const behaviorPatterns = await this.analyzeBehaviorPatterns(userId);

      // 评估用户价值
      const valueMetrics = await this.evaluateUserValue(userId);
      const userValue = valueMetrics.engagementScore;

      // 确定用户分群
      const userSegment = await this.determineUserSegment(userId);

      // 更新或创建用户画像
      await UserProfile.upsert({
        userId,
        interests: interestTags,
        behaviorPatterns,
        userValue,
        userSegment,
        lastUpdated: new Date(),
      });

      console.log(`用户 ${userId} 画像更新完成`);
    } catch (error) {
      console.error('更新用户画像失败:', error);
    }
  }

  /**
   * 获取行为类型对应的评分
   */
  private static getBehaviorScore(behaviorType: string): number {
    const scoreMap: { [key: string]: number } = {
      'view': 1,
      'click': 2,
      'favorite': 3,
      'purchase': 5,
      'share': 2,
      'search': 1,
    };
    
    return scoreMap[behaviorType] || 1;
  }

  /**
   * 批量更新用户画像
   */
  static async batchUpdateUserProfiles(): Promise<void> {
    try {
      console.log('开始批量更新用户画像...');
      
      // 获取所有用户
      const { User } = require('../models/User');
      const users = await User.findAll({
        attributes: ['id'],
      });

      const batchSize = 50;
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(user => this.updateUserProfile(user.id))
        );
        
        console.log(`已处理 ${Math.min(i + batchSize, users.length)} / ${users.length} 用户`);
      }
      
      console.log('批量更新用户画像完成');
    } catch (error) {
      console.error('批量更新用户画像失败:', error);
    }
  }
}

export default UserProfileAnalysis; 