const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/sequelize');
const { User } = require('../src/models/User');
const { Product } = require('../src/models/Product');
const { Order } = require('../src/models/Order');
const { Payment } = require('../src/models/Payment');

describe('Security Tests', () => {
  let testUser;
  let testAdmin;
  let userToken;
  let adminToken;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'securityuser',
      email: 'security@example.com',
      password: 'password123',
      role: 'user'
    });

    // 创建测试管理员
    testAdmin = await User.create({
      username: 'securityadmin',
      email: 'securityadmin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // 创建测试商品
    testProduct = await Product.create({
      name: '安全测试商品',
      description: '用于安全测试的商品',
      price: 100.00,
      originalPrice: 120.00,
      categoryId: '1',
      images: ['security_test.jpg'],
      tags: ['安全', '测试'],
      isActive: true,
      stock: 100,
      salesCount: 0,
      rating: 4.5
    });

    // 创建测试订单
    testOrder = await Order.create({
      userId: testUser.id,
      orderNumber: 'SEC001',
      status: 'pending',
      totalAmount: 100.00,
      paymentAmount: 100.00,
      discountAmount: 0,
      shippingFee: 0,
      shippingAddress: {
        name: 'Security User',
        phone: '13800138000',
        province: '海南省',
        city: '海口市',
        district: '美兰区',
        address: '安全测试地址'
      },
      paymentMethod: 'wechat',
      paymentStatus: 'pending'
    });

    // 获取认证token
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'security@example.com',
        password: 'password123'
      });
    userToken = userLoginResponse.body.token;

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'securityadmin@example.com',
        password: 'password123'
      });
    adminToken = adminLoginResponse.body.token;
  });

  afterAll(async () => {
    // 清理测试数据
    await Payment.destroy({ where: { userId: testUser.id } });
    await Order.destroy({ where: { userId: testUser.id } });
    await Product.destroy({ where: { id: testProduct.id } });
    await User.destroy({ where: { id: testUser.id } });
    await User.destroy({ where: { id: testAdmin.id } });
    await sequelize.close();
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401);

      expect(response.body.message).toBe('未提供认证令牌');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.message).toBe('无效的认证令牌');
    });

    it('should reject expired tokens', async () => {
      // 创建一个过期的token（实际项目中需要测试真实的过期token）
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjE2MTYxNjE2LCJleHAiOjE2MTYxNjE2MTZ9.invalid_signature';

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should prevent SQL injection in login', async () => {
      const maliciousPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1#"
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: payload
          });

        // 应该返回401而不是500（服务器错误）
        expect(response.status).toBe(401);
      }
    });
  });

  describe('Authorization Security', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'GET', path: '/api/admin/users' },
        { method: 'GET', path: '/api/admin/orders' },
        { method: 'GET', path: '/api/admin/products' },
        { method: 'POST', path: '/api/admin/products' },
        { method: 'PUT', path: '/api/admin/products/1' },
        { method: 'DELETE', path: '/api/admin/products/1' }
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body.message).toBe('权限不足');
      }
    });

    it('should prevent users from accessing other users data', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
        role: 'user'
      });

      const otherOrder = await Order.create({
        userId: otherUser.id,
        orderNumber: 'OTHER001',
        status: 'pending',
        totalAmount: 200.00,
        paymentAmount: 200.00,
        discountAmount: 0,
        shippingFee: 0,
        shippingAddress: {
          name: 'Other User',
          phone: '13800138000',
          province: '海南省',
          city: '海口市',
          district: '美兰区',
          address: '其他用户地址'
        },
        paymentMethod: 'wechat',
        paymentStatus: 'pending'
      });

      // 尝试访问其他用户的订单
      const response = await request(app)
        .get(`/api/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      // 清理
      await Order.destroy({ where: { id: otherOrder.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });

    it('should prevent merchants from accessing other merchants data', async () => {
      // 创建商家用户
      const merchantUser = await User.create({
        username: 'merchantuser',
        email: 'merchant@example.com',
        password: 'password123',
        role: 'merchant'
      });

      const merchantProduct = await Product.create({
        name: '商家商品',
        description: '商家商品描述',
        price: 150.00,
        originalPrice: 180.00,
        categoryId: '1',
        images: ['merchant_product.jpg'],
        tags: ['商家', '商品'],
        isActive: true,
        stock: 50,
        salesCount: 0,
        rating: 4.0,
        merchantId: merchantUser.id
      });

      // 尝试访问其他商家的商品
      const response = await request(app)
        .put(`/api/products/${merchantProduct.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '恶意修改',
          price: 1.00
        })
        .expect(403);

      // 清理
      await Product.destroy({ where: { id: merchantProduct.id } });
      await User.destroy({ where: { id: merchantUser.id } });
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent XSS attacks in product creation', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '"><img src="x" onerror="alert(\'XSS\')">'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: payload,
            description: payload,
            price: 100.00,
            originalPrice: 120.00,
            categoryId: '1',
            images: [payload],
            tags: [payload],
            isActive: true,
            stock: 100
          });

        // 应该返回400而不是500
        expect(response.status).toBe(400);
      }
    });

    it('should prevent SQL injection in search parameters', async () => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE products; --",
        "' UNION SELECT * FROM products --",
        "1' OR '1'='1' --",
        "1; DROP TABLE products; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get(`/api/products?search=${encodeURIComponent(payload)}`)
          .expect(200);

        // 应该正常返回而不是服务器错误
        expect(response.status).toBe(200);
      }
    });

    it('should validate file uploads', async () => {
      const maliciousFiles = [
        { name: 'test.php', content: '<?php echo "malicious"; ?>' },
        { name: 'test.js', content: 'alert("malicious")' },
        { name: 'test.exe', content: 'malicious binary content' },
        { name: 'test.bat', content: 'del C:\\Windows\\System32' }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('name', '恶意文件测试')
          .field('description', '测试恶意文件上传')
          .field('price', '100.00')
          .field('originalPrice', '120.00')
          .field('categoryId', '1')
          .field('isActive', 'true')
          .field('stock', '100')
          .attach('images', Buffer.from(file.content), file.name);

        // 应该返回400或415
        expect([400, 415]).toContain(response.status);
      }
    });
  });

  describe('Data Validation Security', () => {
    it('should prevent negative prices', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '负价格商品',
          description: '测试负价格',
          price: -100.00,
          originalPrice: -120.00,
          categoryId: '1',
          images: ['test.jpg'],
          tags: ['测试'],
          isActive: true,
          stock: 100
        });

      expect(response.status).toBe(400);
    });

    it('should prevent excessive quantities', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId: testProduct.id,
              quantity: 999999,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            name: 'Test User',
            phone: '13800138000',
            province: '海南省',
            city: '海口市',
            district: '美兰区',
            address: '测试地址'
          },
          paymentMethod: 'wechat'
        });

      expect(response.status).toBe(400);
    });

    it('should prevent invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: email,
            password: 'password123'
          });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Rate Limiting Security', () => {
    it('should enforce rate limiting on authentication endpoints', async () => {
      const requests = [];
      
      // 发送超过限制的请求
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // 应该有一些请求被限制
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should enforce rate limiting on API endpoints', async () => {
      const requests = [];
      
      // 发送超过限制的请求
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .get('/api/products')
        );
      }

      const responses = await Promise.all(requests);
      
      // 应该有一些请求被限制
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Security', () => {
    it('should prevent payment amount manipulation', async () => {
      // 尝试创建支付金额不匹配的支付
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: testOrder.id,
          paymentMethod: 'wechat',
          amount: 1.00 // 恶意修改金额
        });

      expect(response.status).toBe(400);
    });

    it('should validate payment callback signatures', async () => {
      const maliciousCallback = {
        transaction_id: 'fake_transaction',
        result_code: 'SUCCESS',
        total_fee: 10000,
        fake_signature: 'malicious_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback/wechat')
        .send(maliciousCallback);

      // 应该返回400而不是200
      expect(response.status).toBe(400);
    });
  });

  describe('CSRF Protection', () => {
    it('should prevent CSRF attacks on state-changing operations', async () => {
      // 模拟CSRF攻击
      const csrfResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Origin', 'http://malicious-site.com')
        .set('Referer', 'http://malicious-site.com/attack')
        .send({
          items: [
            {
              productId: testProduct.id,
              quantity: 1,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            name: 'CSRF Test',
            phone: '13800138000',
            province: '海南省',
            city: '海口市',
            district: '美兰区',
            address: 'CSRF测试地址'
          },
          paymentMethod: 'wechat'
        });

      // 应该被阻止或返回错误
      expect([400, 403, 401]).toContain(csrfResponse.status);
    });
  });

  describe('Information Disclosure', () => {
    it('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);

      // 错误信息不应该包含敏感信息
      expect(response.body.message).not.toContain('SQL');
      expect(response.body.message).not.toContain('database');
      expect(response.body.message).not.toContain('password');
    });

    it('should not expose internal server information', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      // 不应该暴露服务器版本信息
      expect(response.headers).not.toHaveProperty('server');
      expect(response.body.message).not.toContain('Express');
      expect(response.body.message).not.toContain('Node.js');
    });
  });
}); 