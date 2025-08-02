import express from 'express';
import { authenticateToken } from '../middleware/auth';
import UserProfile from '../models/UserProfile';
import UserProfileAnalysis from '../utils/userProfileAnalysis';
import Category from '../models/Category';

const router = express.Router();

// 获取用户画像
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 检查权限（只能查看自己的画像或管理员可以查看所有）
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看该用户画像',
      });
    }

    let userProfile = await UserProfile.findOne({
      where: { userId },
    });

    // 如果用户画像不存在，创建新的画像
    if (!userProfile) {
      await UserProfileAnalysis.updateUserProfile(userId);
      userProfile = await UserProfile.findOne({
        where: { userId },
      });
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: '用户画像不存在',
      });
    }

    // 获取兴趣标签的详细信息
    const interests = await Promise.all(
      userProfile.interests.map(async (categoryId: string) => {
        const category = await Category.findByPk(categoryId);
        return {
          id: categoryId,
          name: category?.name || '未知分类',
          score: 0.8, // 这里可以根据实际分析结果设置分数
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...userProfile.toJSON(),
        interests,
      },
      message: '用户画像获取成功',
    });
  } catch (error) {
    console.error('获取用户画像失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户画像失败',
    });
  }
});

// 获取用户兴趣标签
router.get('/:userId/interests', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看该用户兴趣',
      });
    }

    const interests = await UserProfileAnalysis.analyzeUserInterests(userId);
    
    // 获取分类详细信息
    const interestsWithDetails = await Promise.all(
      interests.map(async (interest) => {
        const category = await Category.findByPk(interest.category);
        return {
          ...interest,
          categoryName: category?.name || '未知分类',
        };
      })
    );

    res.json({
      success: true,
      data: interestsWithDetails,
      message: '用户兴趣标签获取成功',
    });
  } catch (error) {
    console.error('获取用户兴趣标签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户兴趣标签失败',
    });
  }
});

// 获取用户行为模式
router.get('/:userId/patterns', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看该用户行为模式',
      });
    }

    const patterns = await UserProfileAnalysis.analyzeBehaviorPatterns(userId);

    res.json({
      success: true,
      data: patterns,
      message: '用户行为模式获取成功',
    });
  } catch (error) {
    console.error('获取用户行为模式失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户行为模式失败',
    });
  }
});

// 获取用户分群
router.get('/:userId/segments', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看该用户分群',
      });
    }

    const userSegment = await UserProfileAnalysis.determineUserSegment(userId);
    const valueMetrics = await UserProfileAnalysis.evaluateUserValue(userId);

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
  } catch (error) {
    console.error('获取用户分群失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户分群失败',
    });
  }
});

// 更新用户画像
router.post('/:userId/update', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限更新该用户画像',
      });
    }

    await UserProfileAnalysis.updateUserProfile(userId);

    res.json({
      success: true,
      message: '用户画像更新成功',
    });
  } catch (error) {
    console.error('更新用户画像失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户画像失败',
    });
  }
});

// 批量更新用户画像（仅管理员）
router.post('/batch-update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理员可以批量更新用户画像',
      });
    }

    // 异步执行批量更新
    UserProfileAnalysis.batchUpdateUserProfiles().catch(error => {
      console.error('批量更新用户画像失败:', error);
    });

    res.json({
      success: true,
      message: '批量更新用户画像任务已启动',
    });
  } catch (error) {
    console.error('启动批量更新失败:', error);
    res.status(500).json({
      success: false,
      message: '启动批量更新失败',
    });
  }
});

// 获取用户画像统计（仅管理员）
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理员可以查看用户画像统计',
      });
    }

    const { UserProfile } = require('../models/UserProfile');
    const { sequelize } = require('../config/sequelize');

    // 获取分群统计
    const segmentStats = await UserProfile.findAll({
      attributes: [
        'userSegment',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('userValue')), 'avgValue'],
      ],
      group: ['userSegment'],
    });

    // 获取价值分布
    const valueDistribution = await UserProfile.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('userValue')), 'avgValue'],
        [sequelize.fn('MAX', sequelize.col('userValue')), 'maxValue'],
        [sequelize.fn('MIN', sequelize.col('userValue')), 'minValue'],
      ],
    });

    // 获取兴趣标签统计
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
  } catch (error) {
    console.error('获取用户画像统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户画像统计失败',
    });
  }
});

// 辅助函数：获取分群名称
function getSegmentName(segment: string): string {
  const segmentNames: { [key: string]: string } = {
    'new': '新用户',
    'active': '活跃用户',
    'vip': 'VIP用户',
    'inactive': '非活跃用户',
  };
  
  return segmentNames[segment] || '未知分群';
}

// 辅助函数：获取分群描述
function getSegmentDescription(segment: string): string {
  const segmentDescriptions: { [key: string]: string } = {
    'new': '新注册用户，需要引导和培养',
    'active': '经常使用平台的活跃用户',
    'vip': '高价值用户，消费能力强',
    'inactive': '长期未活跃的用户',
  };
  
  return segmentDescriptions[segment] || '未知分群描述';
}

export default router; 