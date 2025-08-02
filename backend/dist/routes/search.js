"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const SearchHistory_1 = __importDefault(require("../models/SearchHistory"));
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.get('/fulltext', async (req, res) => {
    try {
        const { q, category, priceMin, priceMax, sortBy = 'relevance', order = 'DESC', page = 1, limit = 20 } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }
        const where = {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${q}%` } },
                { tags: { [sequelize_1.Op.iLike]: `%${q}%` } }
            ]
        };
        if (category) {
            where.categoryId = category;
        }
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin)
                where.price[sequelize_1.Op.gte] = parseFloat(priceMin);
            if (priceMax)
                where.price[sequelize_1.Op.lte] = parseFloat(priceMax);
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await Product_1.default.findAndCountAll({
            where,
            include: [
                {
                    model: Category_1.default,
                    as: 'category',
                    attributes: ['id', 'name']
                }
            ],
            order: sortBy === 'price' ? [['price', order]] :
                sortBy === 'name' ? [['name', order]] :
                    sortBy === 'createdAt' ? [['createdAt', order]] :
                        [sequelize_1.sequelize.literal(`CASE 
               WHEN name ILIKE '${q}' THEN 3
               WHEN name ILIKE '${q}%' THEN 2
               WHEN name ILIKE '%${q}%' THEN 1
               ELSE 0
             END DESC`)],
            limit: Number(limit),
            offset
        });
        const highlightedResults = rows.map(product => {
            const highlightedName = highlightText(product.name, q);
            const highlightedDescription = highlightText(product.description || '', q);
            return {
                ...product.toJSON(),
                highlightedName,
                highlightedDescription
            };
        });
        if (req.user) {
            await SearchHistory_1.default.create({
                userId: req.user.id,
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
    }
    catch (error) {
        console.error('全文搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '搜索失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/suggestions', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }
        const cacheKey = `search_suggestions:${q}:${limit}`;
        const cached = await database_1.redis.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: JSON.parse(cached)
            });
        }
        const productSuggestions = await Product_1.default.findAll({
            where: {
                name: { [sequelize_1.Op.iLike]: `%${q}%` }
            },
            attributes: ['name'],
            group: ['name'],
            order: [['name', 'ASC']],
            limit: Number(limit)
        });
        const categorySuggestions = await Category_1.default.findAll({
            where: {
                name: { [sequelize_1.Op.iLike]: `%${q}%` }
            },
            attributes: ['name'],
            group: ['name'],
            order: [['name', 'ASC']],
            limit: Math.floor(Number(limit) / 2)
        });
        const popularSearches = await SearchHistory_1.default.findAll({
            attributes: [
                'query',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('query')), 'count']
            ],
            where: {
                query: { [sequelize_1.Op.iLike]: `%${q}%` }
            },
            group: ['query'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('query')), 'DESC']],
            limit: Math.floor(Number(limit) / 2)
        });
        const suggestions = {
            products: productSuggestions.map(p => p.name),
            categories: categorySuggestions.map(c => c.name),
            popular: popularSearches.map(s => s.query)
        };
        await database_1.redis.setex(cacheKey, 3600, JSON.stringify(suggestions));
        res.json({
            success: true,
            data: suggestions
        });
    }
    catch (error) {
        console.error('获取搜索建议失败:', error);
        res.status(500).json({
            success: false,
            message: '获取搜索建议失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20 } = req.query;
        const history = await SearchHistory_1.default.findAll({
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
    }
    catch (error) {
        console.error('获取搜索历史失败:', error);
        res.status(500).json({
            success: false,
            message: '获取搜索历史失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.delete('/history/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const deleted = await SearchHistory_1.default.destroy({
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
        }
        else {
            res.status(404).json({
                success: false,
                message: '搜索历史不存在'
            });
        }
    }
    catch (error) {
        console.error('删除搜索历史失败:', error);
        res.status(500).json({
            success: false,
            message: '删除搜索历史失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.delete('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await SearchHistory_1.default.destroy({
            where: { userId }
        });
        res.json({
            success: true,
            message: '搜索历史清空成功'
        });
    }
    catch (error) {
        console.error('清空搜索历史失败:', error);
        res.status(500).json({
            success: false,
            message: '清空搜索历史失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10, days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const popularSearches = await SearchHistory_1.default.findAll({
            attributes: [
                'query',
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('query')), 'count']
            ],
            where: {
                timestamp: {
                    [sequelize_1.Op.gte]: startDate
                }
            },
            group: ['query'],
            order: [[sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('query')), 'DESC']],
            limit: Number(limit)
        });
        res.json({
            success: true,
            data: popularSearches.map(item => ({
                query: item.query,
                count: parseInt(item.dataValues.count)
            }))
        });
    }
    catch (error) {
        console.error('获取热门搜索词失败:', error);
        res.status(500).json({
            success: false,
            message: '获取热门搜索词失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/spell-check', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }
        const suggestions = await getSpellCheckSuggestions(q);
        res.json({
            success: true,
            data: {
                original: q,
                suggestions
            }
        });
    }
    catch (error) {
        console.error('搜索纠错失败:', error);
        res.status(500).json({
            success: false,
            message: '搜索纠错失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const stats = await SearchHistory_1.default.findAll({
            attributes: [
                [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp')), 'date'],
                [sequelize_1.sequelize.fn('COUNT', sequelize_1.sequelize.col('id')), 'searchCount'],
                [sequelize_1.sequelize.fn('AVG', sequelize_1.sequelize.col('resultCount')), 'avgResults']
            ],
            where: {
                userId,
                timestamp: {
                    [sequelize_1.Op.gte]: startDate
                }
            },
            group: [sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp'))],
            order: [[sequelize_1.sequelize.fn('DATE', sequelize_1.sequelize.col('timestamp')), 'ASC']]
        });
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('获取搜索统计失败:', error);
        res.status(500).json({
            success: false,
            message: '获取搜索统计失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
function highlightText(text, query) {
    if (!text || !query)
        return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}
async function getSpellCheckSuggestions(query) {
    const suggestions = [];
    const products = await Product_1.default.findAll({
        attributes: ['name'],
        group: ['name']
    });
    const dictionary = products.map(p => p.name.toLowerCase());
    for (const word of dictionary) {
        const distance = levenshteinDistance(query.toLowerCase(), word);
        if (distance <= 2 && word !== query.toLowerCase()) {
            suggestions.push(word);
        }
    }
    return suggestions.slice(0, 5);
}
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++)
        matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++)
        matrix[j][0] = j;
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
        }
    }
    return matrix[str2.length][str1.length];
}
exports.default = router;
//# sourceMappingURL=search.js.map