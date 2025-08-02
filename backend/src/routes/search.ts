import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Product from '../models/Product';
import Category from '../models/Category';
import SearchHistory from '../models/SearchHistory';
import { Op, sequelize } from 'sequelize';
import { redis } from '../config/database';

const router = express.Router();

/**
 * 全文搜索
 */
router.get('/fulltext', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      priceMin, 
      priceMax, 
      sortBy = 'relevance', 
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 构建搜索条件
    const where: any = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.iLike]: `%${q}%` } }
      ]
    };

    if (category) {
      where.categoryId = category;
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price[Op.gte] = parseFloat(priceMin as string);
      if (priceMax) where.price[Op.lte] = parseFloat(priceMax as string);
    }

    // 计算偏移量
    const offset = (Number(page) - 1) * Number(limit);

    // 执行搜索
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: sortBy === 'price' ? [['price', order]] : 
             sortBy === 'name' ? [['name', order]] :
             sortBy === 'createdAt' ? [['createdAt', order]] :
             [sequelize.literal(`CASE 
               WHEN name ILIKE '${q}' THEN 3
               WHEN name ILIKE '${q}%' THEN 2
               WHEN name ILIKE '%${q}%' THEN 1
               ELSE 0
             END DESC`)],
      limit: Number(limit),
      offset
    });

    // 高亮搜索结果
    const highlightedResults = rows.map(product => {
      const highlightedName = highlightText(product.name, q as string);
      const highlightedDescription = highlightText(product.description || '', q as string);
      
      return {
        ...product.toJSON(),
        highlightedName,
        highlightedDescription
      };
    });

    // 记录搜索历史
    if (req.user) {
      await SearchHistory.create({
        userId: (req.user as any).id,
        query: q,
        resultCount: count,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        results: highlightedResults,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
        query: q
      }
    });
  } catch (error) {
    console.error('全文搜索失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 搜索建议
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 检查缓存
    const cacheKey = `search_suggestions:${q}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached)
      });
    }

    // 获取商品名称建议
    const productSuggestions = await Product.findAll({
      where: {
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['name'],
      group: ['name'],
      order: [['name', 'ASC']],
      limit: Number(limit)
    });

    // 获取分类建议
    const categorySuggestions = await Category.findAll({
      where: {
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['name'],
      group: ['name'],
      order: [['name', 'ASC']],
      limit: Math.floor(Number(limit) / 2)
    });

    // 获取热门搜索词
    const popularSearches = await SearchHistory.findAll({
      attributes: [
        'query',
        [sequelize.fn('COUNT', sequelize.col('query')), 'count']
      ],
      where: {
        query: { [Op.iLike]: `%${q}%` }
      },
      group: ['query'],
      order: [[sequelize.fn('COUNT', sequelize.col('query')), 'DESC']],
      limit: Math.floor(Number(limit) / 2)
    });

    const suggestions = {
      products: productSuggestions.map(p => p.name),
      categories: categorySuggestions.map(c => c.name),
      popular: popularSearches.map(s => s.query)
    };

    // 缓存结果
    await redis.setex(cacheKey, 3600, JSON.stringify(suggestions));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索建议失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 获取搜索历史
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { limit = 20 } = req.query;

    const history = await SearchHistory.findAll({
      where: { userId },
      attributes: [
        'id',
        'query',
        'resultCount',
        'timestamp'
      ],
      order: [['timestamp', 'DESC']],
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索历史失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 删除搜索历史
 */
router.delete('/history/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    const deleted = await SearchHistory.destroy({
      where: {
        id,
        userId
      }
    });

    if (deleted > 0) {
      res.json({
        success: true,
        message: '搜索历史删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '搜索历史不存在'
      });
    }
  } catch (error) {
    console.error('删除搜索历史失败:', error);
    res.status(500).json({
      success: false,
      message: '删除搜索历史失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 清空搜索历史
 */
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    await SearchHistory.destroy({
      where: { userId }
    });

    res.json({
      success: true,
      message: '搜索历史清空成功'
    });
  } catch (error) {
    console.error('清空搜索历史失败:', error);
    res.status(500).json({
      success: false,
      message: '清空搜索历史失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 获取热门搜索词
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const popularSearches = await SearchHistory.findAll({
      attributes: [
        'query',
        [sequelize.fn('COUNT', sequelize.col('query')), 'count']
      ],
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      group: ['query'],
      order: [[sequelize.fn('COUNT', sequelize.col('query')), 'DESC']],
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: popularSearches.map(item => ({
        query: item.query,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('获取热门搜索词失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门搜索词失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 搜索纠错建议
 */
router.get('/spell-check', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 简单的拼写纠错实现
    const suggestions = await getSpellCheckSuggestions(q);

    res.json({
      success: true,
      data: {
        original: q,
        suggestions
      }
    });
  } catch (error) {
    console.error('搜索纠错失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索纠错失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 搜索统计
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const stats = await SearchHistory.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount'],
        [sequelize.fn('AVG', sequelize.col('resultCount')), 'avgResults']
      ],
      where: {
        userId,
        timestamp: {
          [Op.gte]: startDate
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']]
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取搜索统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索统计失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 高亮文本
 */
function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 获取拼写纠错建议
 */
async function getSpellCheckSuggestions(query: string): Promise<string[]> {
  // 简单的拼写纠错实现
  // 在实际项目中可以使用更复杂的算法或第三方服务
  
  const suggestions: string[] = [];
  
  // 获取所有商品名称作为词典
  const products = await Product.findAll({
    attributes: ['name'],
    group: ['name']
  });
  
  const dictionary = products.map(p => p.name.toLowerCase());
  
  // 简单的编辑距离算法
  for (const word of dictionary) {
    const distance = levenshteinDistance(query.toLowerCase(), word);
    if (distance <= 2 && word !== query.toLowerCase()) {
      suggestions.push(word);
    }
  }
  
  return suggestions.slice(0, 5);
}

/**
 * 计算编辑距离
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return matrix[str2.length][str1.length];
}

export default router; 