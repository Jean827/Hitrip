"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CustomerService_1 = require("../models/CustomerService");
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        }
        else {
            cb(new Error('只支持CSV文件'));
        }
    }
});
router.get('/knowledge', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (category) {
            where.category = category;
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } },
                { content: { [sequelize_1.Op.like]: `%${search}%` } },
                { keywords: { [sequelize_1.Op.like]: `%${search}%` } }
            ];
        }
        if (status !== undefined) {
            where.isActive = status === 'active';
        }
        const { count, rows } = await CustomerService_1.KnowledgeBase.findAndCountAll({
            where,
            order: [['priority', 'DESC'], ['createdAt', 'DESC']],
            limit: Number(limit),
            offset
        });
        res.json({
            success: true,
            data: {
                items: rows,
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取知识库列表失败',
            error: error.message
        });
    }
});
router.get('/knowledge/categories', async (req, res) => {
    try {
        const categories = await CustomerService_1.KnowledgeBase.findAll({
            attributes: [
                'category',
                [sequelize_2.default.fn('COUNT', sequelize_2.default.col('id')), 'count']
            ],
            where: { isActive: true },
            group: ['category'],
            order: [['category', 'ASC']]
        });
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类列表失败',
            error: error.message
        });
    }
});
router.get('/knowledge/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const knowledge = await CustomerService_1.KnowledgeBase.findByPk(id);
        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: '知识条目不存在'
            });
        }
        res.json({
            success: true,
            data: knowledge
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取知识条目失败',
            error: error.message
        });
    }
});
router.post('/knowledge', async (req, res) => {
    try {
        const { category, title, content, keywords, tags, priority } = req.body;
        const knowledge = await CustomerService_1.KnowledgeBase.create({
            category,
            title,
            content,
            keywords: keywords || [],
            tags: tags || [],
            priority: priority || 0,
            isActive: true
        });
        res.json({
            success: true,
            data: knowledge,
            message: '知识条目创建成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '创建知识条目失败',
            error: error.message
        });
    }
});
router.put('/knowledge/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, title, content, keywords, tags, priority, isActive } = req.body;
        const knowledge = await CustomerService_1.KnowledgeBase.findByPk(id);
        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: '知识条目不存在'
            });
        }
        await knowledge.update({
            category,
            title,
            content,
            keywords: keywords || knowledge.keywords,
            tags: tags || knowledge.tags,
            priority: priority !== undefined ? priority : knowledge.priority,
            isActive: isActive !== undefined ? isActive : knowledge.isActive
        });
        res.json({
            success: true,
            data: knowledge,
            message: '知识条目更新成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '更新知识条目失败',
            error: error.message
        });
    }
});
router.delete('/knowledge/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const knowledge = await CustomerService_1.KnowledgeBase.findByPk(id);
        if (!knowledge) {
            return res.status(404).json({
                success: false,
                message: '知识条目不存在'
            });
        }
        await knowledge.destroy();
        res.json({
            success: true,
            message: '知识条目删除成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '删除知识条目失败',
            error: error.message
        });
    }
});
router.post('/knowledge/batch-import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请上传CSV文件'
            });
        }
        const results = [];
        const errors = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            results.push(data);
        })
            .on('end', async () => {
            try {
                const createdItems = [];
                for (const row of results) {
                    try {
                        const knowledge = await CustomerService_1.KnowledgeBase.create({
                            category: row.category || '未分类',
                            title: row.title,
                            content: row.content,
                            keywords: row.keywords ? row.keywords.split(',').map((k) => k.trim()) : [],
                            tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
                            priority: parseInt(row.priority) || 0,
                            isActive: row.isActive === 'true' || row.isActive === '1'
                        });
                        createdItems.push(knowledge);
                    }
                    catch (error) {
                        errors.push({
                            row,
                            error: error.message
                        });
                    }
                }
                fs_1.default.unlinkSync(req.file.path);
                res.json({
                    success: true,
                    data: {
                        created: createdItems.length,
                        errors: errors.length,
                        errorDetails: errors
                    },
                    message: `批量导入完成，成功导入${createdItems.length}条，失败${errors.length}条`
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量导入失败',
                    error: error.message
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '批量导入失败',
            error: error.message
        });
    }
});
router.get('/knowledge/export', async (req, res) => {
    try {
        const { category, format = 'csv' } = req.query;
        const where = {};
        if (category) {
            where.category = category;
        }
        const knowledgeList = await CustomerService_1.KnowledgeBase.findAll({
            where,
            order: [['category', 'ASC'], ['priority', 'DESC']]
        });
        if (format === 'json') {
            res.json({
                success: true,
                data: knowledgeList
            });
        }
        else {
            const csvData = knowledgeList.map(item => ({
                category: item.category,
                title: item.title,
                content: item.content,
                keywords: item.keywords.join(','),
                tags: item.tags.join(','),
                priority: item.priority,
                isActive: item.isActive,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=knowledge_base.csv');
            const csvContent = [
                'category,title,content,keywords,tags,priority,isActive,createdAt,updatedAt',
                ...csvData.map(row => `"${row.category}","${row.title}","${row.content}","${row.keywords}","${row.tags}",${row.priority},${row.isActive},"${row.createdAt}","${row.updatedAt}"`)
            ].join('\n');
            res.send(csvContent);
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '导出失败',
            error: error.message
        });
    }
});
router.get('/knowledge/stats', async (req, res) => {
    try {
        const totalCount = await CustomerService_1.KnowledgeBase.count();
        const activeCount = await CustomerService_1.KnowledgeBase.count({ where: { isActive: true } });
        const categoryCount = await CustomerService_1.KnowledgeBase.count({
            attributes: [[sequelize_2.default.fn('DISTINCT', sequelize_2.default.col('category')), 'category']]
        });
        const recentAdded = await CustomerService_1.KnowledgeBase.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        const topCategories = await CustomerService_1.KnowledgeBase.findAll({
            attributes: [
                'category',
                [sequelize_2.default.fn('COUNT', sequelize_2.default.col('id')), 'count']
            ],
            group: ['category'],
            order: [[sequelize_2.default.fn('COUNT', sequelize_2.default.col('id')), 'DESC']],
            limit: 5
        });
        res.json({
            success: true,
            data: {
                totalCount,
                activeCount,
                categoryCount,
                recentAdded,
                topCategories
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取统计信息失败',
            error: error.message
        });
    }
});
router.get('/tickets', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, priority, category } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (category)
            where.category = category;
        const { count, rows } = await CustomerService_1.CustomerTicket.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset
        });
        res.json({
            success: true,
            data: {
                items: rows,
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取工单列表失败',
            error: error.message
        });
    }
});
router.post('/tickets', async (req, res) => {
    try {
        const { userId, title, description, category, priority } = req.body;
        const ticket = await CustomerService_1.CustomerTicket.create({
            userId,
            title,
            description,
            category,
            priority: priority || 'medium',
            status: 'open'
        });
        res.json({
            success: true,
            data: ticket,
            message: '工单创建成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '创建工单失败',
            error: error.message
        });
    }
});
router.put('/tickets/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;
        const ticket = await CustomerService_1.CustomerTicket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: '工单不存在'
            });
        }
        const updateData = { status };
        if (assignedTo)
            updateData.assignedTo = assignedTo;
        if (status === 'resolved')
            updateData.resolvedAt = new Date();
        await ticket.update(updateData);
        res.json({
            success: true,
            data: ticket,
            message: '工单状态更新成功'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '更新工单状态失败',
            error: error.message
        });
    }
});
router.get('/tickets/stats', async (req, res) => {
    try {
        const totalCount = await CustomerService_1.CustomerTicket.count();
        const openCount = await CustomerService_1.CustomerTicket.count({ where: { status: 'open' } });
        const inProgressCount = await CustomerService_1.CustomerTicket.count({ where: { status: 'in_progress' } });
        const resolvedCount = await CustomerService_1.CustomerTicket.count({ where: { status: 'resolved' } });
        const priorityStats = await CustomerService_1.CustomerTicket.findAll({
            attributes: [
                'priority',
                [sequelize_2.default.fn('COUNT', sequelize_2.default.col('id')), 'count']
            ],
            group: ['priority']
        });
        const categoryStats = await CustomerService_1.CustomerTicket.findAll({
            attributes: [
                'category',
                [sequelize_2.default.fn('COUNT', sequelize_2.default.col('id')), 'count']
            ],
            group: ['category']
        });
        res.json({
            success: true,
            data: {
                totalCount,
                openCount,
                inProgressCount,
                resolvedCount,
                priorityStats,
                categoryStats
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取工单统计失败',
            error: error.message
        });
    }
});
router.post('/chat/session', async (req, res) => {
    try {
        const { userId } = req.body;
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = await CustomerService_1.ChatSession.create({
            id: sessionId,
            userId,
            status: 'active',
            startedAt: new Date()
        });
        res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '创建聊天会话失败',
            error: error.message
        });
    }
});
router.post('/chat/message', async (req, res) => {
    try {
        const { sessionId, userId, content, messageType = 'user' } = req.body;
        const message = await CustomerService_1.ChatMessage.create({
            sessionId,
            userId,
            content,
            messageType
        });
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '发送消息失败',
            error: error.message
        });
    }
});
router.get('/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const messages = await CustomerService_1.ChatMessage.findAll({
            where: { sessionId },
            order: [['createdAt', 'ASC']],
            limit: Number(limit),
            offset
        });
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '获取聊天历史失败',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=customerService.js.map