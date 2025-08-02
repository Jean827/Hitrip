"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const UserProfile_1 = __importDefault(require("../models/UserProfile"));
const userProfileAnalysis_1 = __importDefault(require("../utils/userProfileAnalysis"));
const Category_1 = __importDefault(require("../models/Category"));
const router = express_1.default.Router();
router.get('/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限查看该用户画像',
            });
        }
        let userProfile = await UserProfile_1.default.findOne({
            where: { userId },
        });
        if (!userProfile) {
            await userProfileAnalysis_1.default.updateUserProfile(userId);
            userProfile = await UserProfile_1.default.findOne({
                where: { userId },
            });
        }
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: '用户画像不存在',
            });
        }
        const interests = await Promise.all(userProfile.interests.map(async (categoryId) => {
            const category = await Category_1.default.findByPk(categoryId);
            return {
                id: categoryId,
                name: category?.name || '未知分类',
                score: 0.8,
            };
        }));
        res.json({
            success: true,
            data: {
                ...userProfile.toJSON(),
                interests,
            },
            message: '用户画像获取成功',
        });
    }
    catch (error) {
        console.error('获取用户画像失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户画像失败',
        });
    }
});
router.get('/:userId/interests', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限查看该用户兴趣',
            });
        }
        const interests = await userProfileAnalysis_1.default.analyzeUserInterests(userId);
        const interestsWithDetails = await Promise.all(interests.map(async (interest) => {
            const category = await Category_1.default.findByPk(interest.category);
            return {
                ...interest,
                categoryName: category?.name || '未知分类',
            };
        }));
        res.json({
            success: true,
            data: interestsWithDetails,
            message: '用户兴趣标签获取成功',
        });
    }
    catch (error) {
        console.error('获取用户兴趣标签失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户兴趣标签失败',
        });
    }
});
router.get('/:userId/patterns', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限查看该用户行为模式',
            });
        }
        const patterns = await userProfileAnalysis_1.default.analyzeBehaviorPatterns(userId);
        res.json({
            success: true,
            data: patterns,
            message: '用户行为模式获取成功',
        });
    }
    catch (error) {
        console.error('获取用户行为模式失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户行为模式失败',
        });
    }
});
router.get('/:userId/segments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限查看该用户分群',
            });
        }
        const userSegment = await userProfileAnalysis_1.default.determineUserSegment(userId);
        const valueMetrics = await userProfileAnalysis_1.default.evaluateUserValue(userId);
        const segmentInfo = {
            segment: userSegment,
            segmentName: getSegmentName(userSegment),
            description: getSegmentDescription(userSegment),
            valueMetrics,
        };
        res.json({
            success: true,
            data: segmentInfo,
            message: '用户分群信息获取成功',
        });
    }
    catch (error) {
        console.error('获取用户分群失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户分群失败',
        });
    }
});
router.post('/:userId/update', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '没有权限更新该用户画像',
            });
        }
        await userProfileAnalysis_1.default.updateUserProfile(userId);
        res.json({
            success: true,
            message: '用户画像更新成功',
        });
    }
    catch (error) {
        console.error('更新用户画像失败:', error);
        res.status(500).json({
            success: false,
            message: '更新用户画像失败',
        });
    }
});
router.post('/batch-update', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '只有管理员可以批量更新用户画像',
            });
        }
        userProfileAnalysis_1.default.batchUpdateUserProfiles().catch(error => {
            console.error('批量更新用户画像失败:', error);
        });
        res.json({
            success: true,
            message: '批量更新用户画像任务已启动',
        });
    }
    catch (error) {
        console.error('启动批量更新失败:', error);
        res.status(500).json({
            success: false,
            message: '启动批量更新失败',
        });
    }
});
router.get('/stats/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '只有管理员可以查看用户画像统计',
            });
        }
        const { UserProfile } = require('../models/UserProfile');
        const { sequelize } = require('../config/sequelize');
        const segmentStats = await UserProfile.findAll({
            attributes: [
                'userSegment',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('AVG', sequelize.col('userValue')), 'avgValue'],
            ],
            group: ['userSegment'],
        });
        const valueDistribution = await UserProfile.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('AVG', sequelize.col('userValue')), 'avgValue'],
                [sequelize.fn('MAX', sequelize.col('userValue')), 'maxValue'],
                [sequelize.fn('MIN', sequelize.col('userValue')), 'minValue'],
            ],
        });
        const interestStats = await UserProfile.findAll({
            attributes: [
                'interests',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['interests'],
        });
        res.json({
            success: true,
            data: {
                segmentStats,
                valueDistribution: valueDistribution[0],
                interestStats,
                totalUsers: await UserProfile.count(),
            },
            message: '用户画像统计获取成功',
        });
    }
    catch (error) {
        console.error('获取用户画像统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户画像统计失败',
        });
    }
});
function getSegmentName(segment) {
    const segmentNames = {
        'new': '新用户',
        'active': '活跃用户',
        'vip': 'VIP用户',
        'inactive': '非活跃用户',
    };
    return segmentNames[segment] || '未知分群';
}
function getSegmentDescription(segment) {
    const segmentDescriptions = {
        'new': '新注册用户，需要引导和培养',
        'active': '经常使用平台的活跃用户',
        'vip': '高价值用户，消费能力强',
        'inactive': '长期未活跃的用户',
    };
    return segmentDescriptions[segment] || '未知分群描述';
}
exports.default = router;
//# sourceMappingURL=userProfiles.js.map