const request = require('supertest');

// 模拟Express应用
const express = require('express');
const app = express();

// 基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 模拟搜索路由
app.get('/api/search/fulltext', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: '搜索关键词不能为空' });
  }
  
  res.json({
    success: true,
    data: {
      results: [
        { id: 1, name: '海南旅游产品1', description: '测试产品1' },
        { id: 2, name: '海南旅游产品2', description: '测试产品2' }
      ],
      total: 2,
      query: q
    }
  });
});

// 模拟用户认证路由
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
  }
  
  if (email === 'test@example.com' && password === 'TestPassword123!') {
    res.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: { id: 1, email: 'test@example.com', username: 'testuser' }
      }
    });
  } else {
    res.status(401).json({ success: false, message: '邮箱或密码错误' });
  }
});

// 模拟商品路由
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        { id: 1, name: '海南特产1', price: 100 },
        { id: 2, name: '海南特产2', price: 200 }
      ]
    }
  });
});

describe('基本功能测试', () => {
  describe('健康检查', () => {
    test('健康检查接口正常', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('搜索功能', () => {
    test('搜索接口正常工作', async () => {
      const response = await request(app)
        .get('/api/search/fulltext')
        .query({ q: '海南' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.query).toBe('海南');
    });

    test('搜索参数验证', async () => {
      const response = await request(app)
        .get('/api/search/fulltext')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('搜索关键词不能为空');
    });
  });

  describe('用户认证', () => {
    test('用户登录成功', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    test('用户登录失败', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('邮箱或密码错误');
    });

    test('登录参数验证', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('邮箱和密码不能为空');
    });
  });

  describe('商品管理', () => {
    test('获取商品列表', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });
  });

  describe('性能测试', () => {
    test('搜索接口响应时间', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/search/fulltext')
        .query({ q: '海南' })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // 响应时间应小于1秒
    });

    test('并发请求处理', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('错误处理', () => {
    test('404错误处理', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });
}); 