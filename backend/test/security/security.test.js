const request = require('supertest');
const app = require('../../src/index');

describe('安全测试', () => {
  describe('输入验证测试', () => {
    test('SQL注入防护测试', async () => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "1' OR '1' = '1' --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/search/fulltext')
          .query({ q: payload })
          .expect(200);

        // 验证响应不包含敏感信息
        expect(response.body).not.toHaveProperty('sql');
        expect(response.body).not.toHaveProperty('error');
        expect(response.body.success).toBe(true);
      }
    });

    test('XSS攻击防护测试', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '"><script>alert("xss")</script>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: 'test@example.com',
            password: 'TestPassword123!'
          })
          .expect(400);

        // 验证XSS攻击被阻止
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('验证失败');
      }
    });

    test('路径遍历攻击防护测试', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request(app)
          .get(`/api/products/${payload}`)
          .expect(404);

        // 验证路径遍历攻击被阻止
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('认证与授权测试', () => {
    test('未授权访问保护', async () => {
      const protectedEndpoints = [
        '/api/user/profile',
        '/api/orders',
        '/api/cart',
        '/api/admin/users'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('未授权');
      }
    });

    test('无效Token处理', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Authorization', token)
          .expect(401);

        expect(response.body.success).toBe(false);
      }
    });

    test('权限越权测试', async () => {
      // 先注册一个普通用户
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // 登录获取token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      const userToken = loginResponse.body.data.token;

      // 尝试访问管理员接口
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('数据验证测试', () => {
    test('邮箱格式验证', async () => {
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
            password: 'TestPassword123!'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('邮箱');
      }
    });

    test('密码强度验证', async () => {
      const weakPasswords = [
        '123',
        'password',
        '123456',
        'qwerty',
        'abc123'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: 'test@example.com',
            password: password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('密码');
      }
    });

    test('输入长度限制', async () => {
      const longInput = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: longInput,
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('CSRF防护测试', () => {
    test('CSRF Token验证', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(201);

      // 验证响应包含CSRF保护
      expect(response.headers).toHaveProperty('x-csrf-token');
    });
  });

  describe('速率限制测试', () => {
    test('登录速率限制', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // 发送多个快速请求
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send(loginData)
        );
      }

      const responses = await Promise.all(promises);
      
      // 验证某些请求被限制
      const rateLimited = responses.some(response => response.status === 429);
      expect(rateLimited).toBe(true);
    });

    test('搜索速率限制', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .get('/api/search/fulltext')
            .query({ q: `test${i}` })
        );
      }

      const responses = await Promise.all(promises);
      
      // 验证某些请求被限制
      const rateLimited = responses.some(response => response.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('敏感信息泄露测试', () => {
    test('错误信息不泄露敏感数据', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      // 验证错误信息不包含敏感信息
      expect(response.body.message).not.toContain('password');
      expect(response.body.message).not.toContain('token');
      expect(response.body.message).not.toContain('secret');
      expect(response.body).not.toHaveProperty('stack');
    });

    test('数据库错误不泄露结构', async () => {
      // 尝试触发数据库错误
      const response = await request(app)
        .get('/api/search/fulltext')
        .query({ q: "' OR 1=1 --" })
        .expect(200);

      // 验证响应不包含数据库结构信息
      expect(response.body).not.toHaveProperty('sql');
      expect(response.body).not.toHaveProperty('query');
      expect(response.body).not.toHaveProperty('table');
    });
  });

  describe('文件上传安全测试', () => {
    test('文件类型验证', async () => {
      const maliciousFiles = [
        { name: 'test.exe', type: 'application/x-msdownload' },
        { name: 'test.php', type: 'application/x-httpd-php' },
        { name: 'test.jsp', type: 'application/x-jsp' },
        { name: 'test.sh', type: 'application/x-sh' }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/user/avatar')
          .attach('avatar', Buffer.from('test'), file.name)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('文件类型');
      }
    });

    test('文件大小限制', async () => {
      const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB

      const response = await request(app)
        .post('/api/user/avatar')
        .attach('avatar', largeFile, 'large.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('文件大小');
    });
  });

  describe('HTTP安全头测试', () => {
    test('安全头配置', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // 验证安全头
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });

    test('CORS配置', async () => {
      const response = await request(app)
        .options('/api/products')
        .set('Origin', 'http://malicious-site.com')
        .expect(200);

      // 验证CORS配置正确
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('会话安全测试', () => {
    test('会话超时', async () => {
      // 创建会话
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // 等待会话超时（在测试环境中可能需要调整）
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 尝试使用过期token
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
}); 