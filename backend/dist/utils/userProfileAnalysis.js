"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileAnalysis = void 0;
const UserBehavior_1 = __importDefault(require("../models/UserBehavior"));
const UserProfile_1 = __importDefault(require("../models/UserProfile"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
class UserProfileAnalysis {
    static async analyzeUserInterests(userId) {
        try {
            const behaviors = await UserBehavior_1.default.findAll({
                where: {
                    userId,
                    targetType: 'product',
                },
                include: [
                    {
                        model: Product_1.default,
                        as: 'product',
                        include: [
                            {
                                model: Category_1.default,
                                as: 'category',
                                attributes: ['id', 'name'],
                            },
                        ],
                    },
                ],
                order: [['timestamp', 'DESC']],
            });
            const categoryStats = {};
            behaviors.forEach(behavior => {
                const categoryId = behavior.product?.category?.id;
                if (!categoryId)
                    return;
                const behaviorScore = this.getBehaviorScore(behavior.behaviorType);
                if (categoryStats[categoryId]) {
                    categoryStats[categoryId].score += behaviorScore;
                    categoryStats[categoryId].frequency += 1;
                }
                else {
                    categoryStats[categoryId] = {
                        score: behaviorScore,
                        frequency: 1,
                    };
                }
            });
            const interests = Object.entries(categoryStats)
                .map(([categoryId, stats]) => ({
                category: categoryId,
                score: Math.min(1, stats.score / 10),
                frequency: stats.frequency,
            }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            return interests;
        }
        catch (error) {
            console.error('分析用户兴趣失败:', error);
            return [];
        }
    }
    static async analyzeBehaviorPatterns(userId) {
        try {
            const behaviors = await UserBehavior_1.default.findAll({
                where: { userId },
                order: [['timestamp', 'ASC']],
            });
            const patterns = {};
            const timePatterns = this.analyzeTimePatterns(behaviors);
            patterns['time'] = timePatterns;
            const sequencePatterns = this.analyzeSequencePatterns(behaviors);
            patterns['sequence'] = sequencePatterns;
            const pagePatterns = this.analyzePagePatterns(behaviors);
            patterns['page'] = pagePatterns;
            return Object.values(patterns);
        }
        catch (error) {
            console.error('分析用户行为模式失败:', error);
            return [];
        }
    }
    static analyzeTimePatterns(behaviors) {
        const timeSlots = {};
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
    static analyzeSequencePatterns(behaviors) {
        const sequences = {};
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
    static analyzePagePatterns(behaviors) {
        const pageVisits = {};
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
    static async evaluateUserValue(userId) {
        try {
            const purchaseBehaviors = await UserBehavior_1.default.findAll({
                where: {
                    userId,
                    behaviorType: 'purchase',
                    targetType: 'product',
                },
                include: [
                    {
                        model: Product_1.default,
                        as: 'product',
                        attributes: ['id', 'name', 'price'],
                    },
                ],
                order: [['timestamp', 'DESC']],
            });
            const totalPurchases = purchaseBehaviors.length;
            const totalSpent = purchaseBehaviors.reduce((sum, behavior) => {
                return sum + (behavior.product?.price || 0);
            }, 0);
            const avgOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
            const lastPurchaseDate = purchaseBehaviors.length > 0 ? purchaseBehaviors[0].timestamp : null;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentPurchases = purchaseBehaviors.filter(behavior => behavior.timestamp >= thirtyDaysAgo);
            const purchaseFrequency = recentPurchases.length;
            const allBehaviors = await UserBehavior_1.default.findAll({
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
        }
        catch (error) {
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
    static calculateEngagementScore(behaviors) {
        const behaviorWeights = {
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
        return Math.min(100, totalScore / 10);
    }
    static async determineUserSegment(userId) {
        try {
            const valueMetrics = await this.evaluateUserValue(userId);
            if (valueMetrics.totalPurchases === 0) {
                return 'new';
            }
            else if (valueMetrics.engagementScore >= 80 && valueMetrics.totalSpent >= 1000) {
                return 'vip';
            }
            else if (valueMetrics.engagementScore >= 50 || valueMetrics.purchaseFrequency >= 3) {
                return 'active';
            }
            else {
                return 'inactive';
            }
        }
        catch (error) {
            console.error('确定用户分群失败:', error);
            return 'new';
        }
    }
    static async updateUserProfile(userId) {
        try {
            console.log(`开始更新用户 ${userId} 的画像...`);
            const interests = await this.analyzeUserInterests(userId);
            const interestTags = interests.map(interest => interest.category);
            const behaviorPatterns = await this.analyzeBehaviorPatterns(userId);
            const valueMetrics = await this.evaluateUserValue(userId);
            const userValue = valueMetrics.engagementScore;
            const userSegment = await this.determineUserSegment(userId);
            await UserProfile_1.default.upsert({
                userId,
                interests: interestTags,
                behaviorPatterns,
                userValue,
                userSegment,
                lastUpdated: new Date(),
            });
            console.log(`用户 ${userId} 画像更新完成`);
        }
        catch (error) {
            console.error('更新用户画像失败:', error);
        }
    }
    static getBehaviorScore(behaviorType) {
        const scoreMap = {
            'view': 1,
            'click': 2,
            'favorite': 3,
            'purchase': 5,
            'share': 2,
            'search': 1,
        };
        return scoreMap[behaviorType] || 1;
    }
    static async batchUpdateUserProfiles() {
        try {
            console.log('开始批量更新用户画像...');
            const { User } = require('../models/User');
            const users = await User.findAll({
                attributes: ['id'],
            });
            const batchSize = 50;
            for (let i = 0; i < users.length; i += batchSize) {
                const batch = users.slice(i, i + batchSize);
                await Promise.all(batch.map(user => this.updateUserProfile(user.id)));
                console.log(`已处理 ${Math.min(i + batchSize, users.length)} / ${users.length} 用户`);
            }
            console.log('批量更新用户画像完成');
        }
        catch (error) {
            console.error('批量更新用户画像失败:', error);
        }
    }
}
exports.UserProfileAnalysis = UserProfileAnalysis;
exports.default = UserProfileAnalysis;
//# sourceMappingURL=userProfileAnalysis.js.map