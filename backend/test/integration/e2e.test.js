const request = require('supertest');
const app = require('../../src/index');
const { connectMongoDB, closeConnections } = require('../../src/config/database');

describe('端到端功能测试', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // 连接测试数据库
    await connectMongoDB();
  });

  afterAll(async () => {
    // 清理测试数据
    await closeConnections();
  });

  describe('用户认证流程测试', () => {
    test('用户注册流程', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        phone: '13800138000'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    test('用户登录流程', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');

      authToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    test('获取用户信息', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
    });
  });

  describe('搜索功能测试', () => {
    test('全文搜索功能', async () => {
      const searchQuery = '海南';

      const response = await request(app)
        .get('/api/search/fulltext')
        .query({ q: searchQuery })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('query');
    });

    test('搜索建议功能', async () => {
      const searchQuery = '海';

      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ q: searchQuery })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('popular');
    });

    test('搜索历史记录', async () => {
      const response = await request(app)
        .get('/api/search/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('搜索纠错功能', async () => {
      const misspelledQuery = '海南岛';

      const response = await request(app)
        .get('/api/search/spell-check')
        .query({ q: misspelledQuery })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('original');
      expect(response.body.data).toHaveProperty('suggestions');
    });
  });

  describe('商品管理测试', () => {
    test('获取商品列表', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    test('获取商品详情', async () => {
      // 先获取商品列表，然后测试第一个商品的详情
      const listResponse = await request(app)
        .get('/api/products')
        .expect(200);

      if (listResponse.body.data.products.length > 0) {
        const productId = listResponse.body.data.products[0].id;

        const response = await request(app)
          .get(`/api/products/${productId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    test('商品分类查询', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('购物车功能测试', () => {
    test('添加商品到购物车', async () => {
      // 先获取商品列表
      const listResponse = await request(app)
        .get('/api/products')
        .expect(200);

      if (listResponse.body.data.products.length > 0) {
        const productId = listResponse.body.data.products[0].id;
        const cartData = {
          productId: productId,
          quantity: 1
        };

        const response = await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send(cartData)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    test('获取购物车', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });
  });

  describe('订单功能测试', () => {
    test('创建订单', async () => {
      const orderData = {
        items: [
          {
            productId: 1,
            quantity: 1,
            price: 100
          }
        ],
        shippingAddress: {
          name: '测试用户',
          phone: '13800138000',
          address: '海南省海口市测试地址'
        },
        paymentMethod: 'wechat'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status');
    });

    test('获取订单列表', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });
  });

  describe('支付功能测试', () => {
    test('创建支付订单', async () => {
      const paymentData = {
        orderId: 1,
        amount: 100,
        paymentMethod: 'wechat'
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentId');
    });
  });

  describe('用户权限测试', () => {
    test('未授权访问保护', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('未授权');
    });

    test('管理员权限验证', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403); // 普通用户无法访问管理员接口

      expect(response.body.success).toBe(false);
    });
  });

  describe('API健康检查', () => {
    test('健康检查接口', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    test('API文档接口', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('错误处理测试', () => {
    test('404错误处理', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('接口不存在');
    });

    test('参数验证错误', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
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

      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
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
}); 