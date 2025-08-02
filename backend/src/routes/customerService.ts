import express from 'express';
import { KnowledgeBase, CustomerTicket, ChatMessage, ChatSession } from '../models/CustomerService';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('只支持CSV文件'));
    }
  }
});

// 获取知识库列表
router.get('/knowledge', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { keywords: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status !== undefined) {
      where.isActive = status === 'active';
    }
    
    const { count, rows } = await KnowledgeBase.findAndCountAll({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取知识库列表失败',
      error: error.message
    });
  }
});

// 获取知识库分类列表
router.get('/knowledge/categories', async (req, res) => {
  try {
    const categories = await KnowledgeBase.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 获取单个知识条目
router.get('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await KnowledgeBase.findByPk(id);
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取知识条目失败',
      error: error.message
    });
  }
});

// 创建知识条目
router.post('/knowledge', async (req, res) => {
  try {
    const { category, title, content, keywords, tags, priority } = req.body;
    
    const knowledge = await KnowledgeBase.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建知识条目失败',
      error: error.message
    });
  }
});

// 更新知识条目
router.put('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, keywords, tags, priority, isActive } = req.body;
    
    const knowledge = await KnowledgeBase.findByPk(id);
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新知识条目失败',
      error: error.message
    });
  }
});

// 删除知识条目
router.delete('/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knowledge = await KnowledgeBase.findByPk(id);
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除知识条目失败',
      error: error.message
    });
  }
});

// 批量导入知识条目
router.post('/knowledge/batch-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传CSV文件'
      });
    }
    
    const results: any[] = [];
    const errors: any[] = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          const createdItems = [];
          
          for (const row of results) {
            try {
              const knowledge = await KnowledgeBase.create({
                category: row.category || '未分类',
                title: row.title,
                content: row.content,
                keywords: row.keywords ? row.keywords.split(',').map((k: string) => k.trim()) : [],
                tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                priority: parseInt(row.priority) || 0,
                isActive: row.isActive === 'true' || row.isActive === '1'
              });
              createdItems.push(knowledge);
            } catch (error) {
              errors.push({
                row,
                error: error.message
              });
            }
          }
          
          // 删除临时文件
          fs.unlinkSync(req.file.path);
          
          res.json({
            success: true,
            data: {
              created: createdItems.length,
              errors: errors.length,
              errorDetails: errors
            },
            message: `批量导入完成，成功导入${createdItems.length}条，失败${errors.length}条`
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: '批量导入失败',
            error: error.message
          });
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量导入失败',
      error: error.message
    });
  }
});

// 导出知识库数据
router.get('/knowledge/export', async (req, res) => {
  try {
    const { category, format = 'csv' } = req.query;
    
    const where: any = {};
    if (category) {
      where.category = category;
    }
    
    const knowledgeList = await KnowledgeBase.findAll({
      where,
      order: [['category', 'ASC'], ['priority', 'DESC']]
    });
    
    if (format === 'json') {
      res.json({
        success: true,
        data: knowledgeList
      });
    } else {
      // CSV格式导出
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
      
      // 生成CSV内容
      const csvContent = [
        'category,title,content,keywords,tags,priority,isActive,createdAt,updatedAt',
        ...csvData.map(row => 
          `"${row.category}","${row.title}","${row.content}","${row.keywords}","${row.tags}",${row.priority},${row.isActive},"${row.createdAt}","${row.updatedAt}"`
        )
      ].join('\n');
      
      res.send(csvContent);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 知识库统计信息
router.get('/knowledge/stats', async (req, res) => {
  try {
    const totalCount = await KnowledgeBase.count();
    const activeCount = await KnowledgeBase.count({ where: { isActive: true } });
    const categoryCount = await KnowledgeBase.count({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']]
    });
    
    const recentAdded = await KnowledgeBase.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    const topCategories = await KnowledgeBase.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

// 工单相关路由
router.get('/tickets', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    
    const { count, rows } = await CustomerTicket.findAndCountAll({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取工单列表失败',
      error: error.message
    });
  }
});

// 创建工单
router.post('/tickets', async (req, res) => {
  try {
    const { userId, title, description, category, priority } = req.body;
    
    const ticket = await CustomerTicket.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建工单失败',
      error: error.message
    });
  }
});

// 更新工单状态
router.put('/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    const ticket = await CustomerTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }
    
    const updateData: any = { status };
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status === 'resolved') updateData.resolvedAt = new Date();
    
    await ticket.update(updateData);
    
    res.json({
      success: true,
      data: ticket,
      message: '工单状态更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新工单状态失败',
      error: error.message
    });
  }
});

// 获取工单统计
router.get('/tickets/stats', async (req, res) => {
  try {
    const totalCount = await CustomerTicket.count();
    const openCount = await CustomerTicket.count({ where: { status: 'open' } });
    const inProgressCount = await CustomerTicket.count({ where: { status: 'in_progress' } });
    const resolvedCount = await CustomerTicket.count({ where: { status: 'resolved' } });
    
    const priorityStats = await CustomerTicket.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    const categoryStats = await CustomerTicket.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取工单统计失败',
      error: error.message
    });
  }
});

// 聊天相关路由
router.post('/chat/session', async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await ChatSession.create({
      id: sessionId,
      userId,
      status: 'active',
      startedAt: new Date()
    });
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建聊天会话失败',
      error: error.message
    });
  }
});

// 发送消息
router.post('/chat/message', async (req, res) => {
  try {
    const { sessionId, userId, content, messageType = 'user' } = req.body;
    
    const message = await ChatMessage.create({
      sessionId,
      userId,
      content,
      messageType
    });
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '发送消息失败',
      error: error.message
    });
  }
});

// 获取聊天历史
router.get('/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const messages = await ChatMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: Number(limit),
      offset
    });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取聊天历史失败',
      error: error.message
    });
  }
});

export default router; 