"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserBehavior_1 = __importDefault(require("../models/UserBehavior"));
const UserSimilarity_1 = __importDefault(require("../models/UserSimilarity"));
const ItemSimilarity_1 = __importDefault(require("../models/ItemSimilarity"));
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CollaborativeFiltering {
    static async getUserBasedRecommendations(userId, limit = 10) {
        try {
            const cacheKey = `user_recommendations:${userId}:${limit}`;
            const cached = await database_1.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const userBehaviors = await UserBehavior_1.default.findAll({
                where: { userId },
                attributes: ['productId', 'behaviorType', 'timestamp'],
                order: [['timestamp', 'DESC']]
            });
            if (userBehaviors.length === 0) {
                return [];
            }
            const similarUsers = await this.findSimilarUsers(userId, userBehaviors);
            if (similarUsers.length === 0) {
                return [];
            }
            const similarUserIds = similarUsers.map(u => u.userId);
            const similarUserBehaviors = await UserBehavior_1.default.findAll({
                where: {
                    userId: { [sequelize_1.Op.in]: similarUserIds },
                    behaviorType: { [sequelize_1.Op.in]: ['view', 'purchase', 'add_to_cart'] }
                },
                attributes: ['userId', 'productId', 'behaviorType', 'timestamp'],
                order: [['timestamp', 'DESC']]
            });
            const recommendations = this.calculateRecommendationScores(userId, userBehaviors, similarUsers, similarUserBehaviors);
            const purchasedProducts = userBehaviors
                .filter(b => b.behaviorType === 'purchase')
                .map(b => b.productId);
            const filteredRecommendations = recommendations
                .filter(rec => !purchasedProducts.includes(rec.productId))
                .slice(0, limit);
            await database_1.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(filteredRecommendations));
            return filteredRecommendations;
        }
        catch (error) {
            console.error('获取基于用户的推荐失败:', error);
            return [];
        }
    }
    static async getItemBasedRecommendations(userId, limit = 10) {
        try {
            const cacheKey = `item_recommendations:${userId}:${limit}`;
            const cached = await database_1.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const userBehaviors = await UserBehavior_1.default.findAll({
                where: { userId },
                attributes: ['productId', 'behaviorType', 'timestamp'],
                order: [['timestamp', 'DESC']],
                limit: 20
            });
            if (userBehaviors.length === 0) {
                return [];
            }
            const interestedProducts = userBehaviors
                .filter(b => ['view', 'purchase', 'add_to_cart'].includes(b.behaviorType))
                .map(b => b.productId);
            if (interestedProducts.length === 0) {
                return [];
            }
            const similarItems = await ItemSimilarity_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { productId1: { [sequelize_1.Op.in]: interestedProducts } },
                        { productId2: { [sequelize_1.Op.in]: interestedProducts } }
                    ],
                    similarity: { [sequelize_1.Op.gt]: this.SIMILARITY_THRESHOLD }
                },
                order: [['similarity', 'DESC']],
                limit: this.MAX_RECOMMENDATIONS
            });
            const recommendations = this.calculateItemBasedScores(userId, userBehaviors, similarItems, interestedProducts);
            const purchasedProducts = userBehaviors
                .filter(b => b.behaviorType === 'purchase')
                .map(b => b.productId);
            const filteredRecommendations = recommendations
                .filter(rec => !purchasedProducts.includes(rec.productId))
                .slice(0, limit);
            await database_1.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(filteredRecommendations));
            return filteredRecommendations;
        }
        catch (error) {
            console.error('获取基于商品的推荐失败:', error);
            return [];
        }
    }
    static async getHybridRecommendations(userId, limit = 10) {
        try {
            const cacheKey = `hybrid_recommendations:${userId}:${limit}`;
            const cached = await database_1.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const [userBased, itemBased] = await Promise.all([
                this.getUserBasedRecommendations(userId, limit * 2),
                this.getItemBasedRecommendations(userId, limit * 2)
            ]);
            const hybridRecommendations = this.mergeRecommendations(userBased, itemBased, limit);
            await database_1.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(hybridRecommendations));
            return hybridRecommendations;
        }
        catch (error) {
            console.error('获取混合推荐失败:', error);
            return [];
        }
    }
    static async calculateUserSimilarity(userId1, userId2) {
        try {
            const cacheKey = `user_similarity:${userId1}:${userId2}`;
            const cached = await database_1.redis.get(cacheKey);
            if (cached) {
                return parseFloat(cached);
            }
            const [user1Behaviors, user2Behaviors] = await Promise.all([
                UserBehavior_1.default.findAll({
                    where: { userId: userId1 },
                    attributes: ['productId', 'behaviorType']
                }),
                UserBehavior_1.default.findAll({
                    where: { userId: userId2 },
                    attributes: ['productId', 'behaviorType']
                })
            ]);
            if (user1Behaviors.length === 0 || user2Behaviors.length === 0) {
                return 0;
            }
            const user1Products = new Set(user1Behaviors.map(b => b.productId));
            const user2Products = new Set(user2Behaviors.map(b => b.productId));
            const intersection = new Set([...user1Products].filter(x => user2Products.has(x)));
            const union = new Set([...user1Products, ...user2Products]);
            const similarity = union.size > 0 ? intersection.size / union.size : 0;
            await database_1.redis.setex(cacheKey, this.CACHE_TTL, similarity.toString());
            return similarity;
        }
        catch (error) {
            console.error('计算用户相似度失败:', error);
            return 0;
        }
    }
    static async calculateItemSimilarity(productId1, productId2) {
        try {
            const cacheKey = `item_similarity:${productId1}:${productId2}`;
            const cached = await database_1.redis.get(cacheKey);
            if (cached) {
                return parseFloat(cached);
            }
            const [product1Behaviors, product2Behaviors] = await Promise.all([
                UserBehavior_1.default.findAll({
                    where: { productId: productId1 },
                    attributes: ['userId', 'behaviorType']
                }),
                UserBehavior_1.default.findAll({
                    where: { productId: productId2 },
                    attributes: ['userId', 'behaviorType']
                })
            ]);
            if (product1Behaviors.length === 0 || product2Behaviors.length === 0) {
                return 0;
            }
            const product1Users = new Set(product1Behaviors.map(b => b.userId));
            const product2Users = new Set(product2Behaviors.map(b => b.userId));
            const intersection = new Set([...product1Users].filter(x => product2Users.has(x)));
            const similarity = Math.sqrt(product1Users.size * product2Users.size) > 0 ?
                intersection.size / Math.sqrt(product1Users.size * product2Users.size) : 0;
            await database_1.redis.setex(cacheKey, this.CACHE_TTL, similarity.toString());
            return similarity;
        }
        catch (error) {
            console.error('计算商品相似度失败:', error);
            return 0;
        }
    }
    static async updateRecommendations(userId, productId, behaviorType) {
        try {
            const cacheKeys = [
                `user_recommendations:${userId}:*`,
                `item_recommendations:${userId}:*`,
                `hybrid_recommendations:${userId}:*`
            ];
            for (const pattern of cacheKeys) {
                const keys = await database_1.redis.keys(pattern);
                if (keys.length > 0) {
                    await database_1.redis.del(...keys);
                }
            }
            this.updateSimilarities(userId, productId, behaviorType);
        }
        catch (error) {
            console.error('更新推荐失败:', error);
        }
    }
    static async findSimilarUsers(userId, userBehaviors) {
        try {
            const allUsers = await UserBehavior_1.default.findAll({
                attributes: ['userId'],
                group: ['userId'],
                having: sequelize_1.sequelize.literal('COUNT(*) > 5')
            });
            const similarUsers = [];
            const userProducts = new Set(userBehaviors.map(b => b.productId));
            for (const user of allUsers) {
                if (user.userId === userId)
                    continue;
                const otherUserBehaviors = await UserBehavior_1.default.findAll({
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
        }
        catch (error) {
            console.error('查找相似用户失败:', error);
            return [];
        }
    }
    static calculateRecommendationScores(userId, userBehaviors, similarUsers, similarUserBehaviors) {
        const scores = new Map();
        const userProductSet = new Set(userBehaviors.map(b => b.productId));
        for (const behavior of similarUserBehaviors) {
            if (userProductSet.has(behavior.productId))
                continue;
            const similarUser = similarUsers.find(u => u.userId === behavior.userId);
            if (!similarUser)
                continue;
            const weight = this.getBehaviorWeight(behavior.behaviorType);
            const score = similarUser.similarity * weight;
            if (scores.has(behavior.productId)) {
                scores.set(behavior.productId, scores.get(behavior.productId) + score);
            }
            else {
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
    static calculateItemBasedScores(userId, userBehaviors, similarItems, interestedProducts) {
        const scores = new Map();
        const userProductSet = new Set(userBehaviors.map(b => b.productId));
        for (const item of similarItems) {
            const similarProductId = item.productId1 === interestedProducts[0] ?
                item.productId2 : item.productId1;
            if (userProductSet.has(similarProductId))
                continue;
            const score = item.similarity;
            if (scores.has(similarProductId)) {
                scores.set(similarProductId, scores.get(similarProductId) + score);
            }
            else {
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
    static mergeRecommendations(userBased, itemBased, limit) {
        const merged = new Map();
        for (const rec of userBased) {
            merged.set(rec.productId, {
                ...rec,
                score: rec.score * 0.6
            });
        }
        for (const rec of itemBased) {
            if (merged.has(rec.productId)) {
                merged.get(rec.productId).score += rec.score * 0.4;
            }
            else {
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
    static getBehaviorWeight(behaviorType) {
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
    static async updateSimilarities(userId, productId, behaviorType) {
        try {
            const allUsers = await UserBehavior_1.default.findAll({
                attributes: ['userId'],
                group: ['userId'],
                having: sequelize_1.sequelize.literal('COUNT(*) > 5')
            });
            for (const user of allUsers) {
                if (user.userId === userId)
                    continue;
                const similarity = await this.calculateUserSimilarity(userId, user.userId);
                await UserSimilarity_1.default.upsert({
                    userId1: Math.min(userId, user.userId),
                    userId2: Math.max(userId, user.userId),
                    similarity
                });
            }
            const allProducts = await UserBehavior_1.default.findAll({
                attributes: ['productId'],
                group: ['productId'],
                having: sequelize_1.sequelize.literal('COUNT(*) > 3')
            });
            for (const product of allProducts) {
                if (product.productId === productId)
                    continue;
                const similarity = await this.calculateItemSimilarity(productId, product.productId);
                await ItemSimilarity_1.default.upsert({
                    productId1: Math.min(productId, product.productId),
                    productId2: Math.max(productId, product.productId),
                    similarity
                });
            }
        }
        catch (error) {
            console.error('更新相似度失败:', error);
        }
    }
}
CollaborativeFiltering.CACHE_TTL = 3600;
CollaborativeFiltering.SIMILARITY_THRESHOLD = 0.1;
CollaborativeFiltering.MAX_RECOMMENDATIONS = 50;
exports.default = CollaborativeFiltering;
//# sourceMappingURL=collaborativeFiltering.js.map