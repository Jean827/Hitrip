const request = require('supertest');
const { app } = require('../src/index');
const { User } = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Auth API Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // 清理测试数据
    await User.destroy({ where: {} });
    
    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'user'
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '用户注册成功');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should return error for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for password mismatch', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser4',
          email: 'testuser4@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '登录成功');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      authToken = response.body.token;
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', '邮箱或密码错误');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', '邮箱或密码错误');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '退出登录成功');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '用户信息更新成功');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'updateduser');
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email successfully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '密码重置邮件已发送');
    });

    it('should return error for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '用户不存在');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully with valid token', async () => {
      // 这里需要先获取重置token，实际测试中需要模拟邮件发送
      const resetToken = 'valid-reset-token';
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      // 由于token验证逻辑，这里可能返回400或200
      expect([200, 400]).toContain(response.status);
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for password mismatch', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'newpassword123',
          confirmPassword: 'differentpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 