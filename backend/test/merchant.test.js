const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/sequelize');
const { Merchant, MerchantStatus, VerificationStatus } = require('../src/models/Merchant');
const { User } = require('../src/models/User');

describe('Merchant API Tests', () => {
  let testUser;
  let testAdmin;
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'testmerchant',
      email: 'merchant@example.com',
      password: 'password123',
      role: 'user'
    });

    // 创建测试管理员
    testAdmin = await User.create({
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // 获取用户认证token
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'merchant@example.com',
        password: 'password123'
      });

    authToken = userLoginResponse.body.token;

    // 获取管理员认证token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    adminToken = adminLoginResponse.body.token;
  });

  afterAll(async () => {
    // 清理测试数据
    await Merchant.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    await User.destroy({ where: { id: testAdmin.id } });
    await sequelize.close();
  });

  describe('POST /api/merchants/register', () => {
    it('should register a new merchant successfully', async () => {
      const merchantData = {
        name: '测试商家',
        description: '这是一个测试商家',
        logo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        banner: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        contactPhone: '13800138000',
        contactEmail: 'merchant@example.com',
        address: '海南省海口市美兰区测试地址',
        businessLicense: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        idCardFront: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        idCardBack: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行'
      };

      const response = await request(app)
        .post('/api/merchants/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(merchantData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('商家入驻申请提交成功，请等待审核');
      expect(response.body.data.name).toBe('测试商家');
      expect(response.body.data.status).toBe(MerchantStatus.PENDING);
      expect(response.body.data.verificationStatus).toBe(VerificationStatus.PENDING);

      // 验证用户角色已更新
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.role).toBe('merchant');
    });

    it('should return 400 if user is already a merchant', async () => {
      // 先创建一个商家记录
      await Merchant.create({
        userId: testUser.id,
        name: '已存在的商家',
        description: '测试描述',
        logo: 'test_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'merchant@example.com',
        address: '测试地址',
        businessLicense: 'test_license.jpg',
        idCardFront: 'test_front.jpg',
        idCardBack: 'test_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行',
        status: MerchantStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING
      });

      const merchantData = {
        name: '重复申请商家',
        description: '测试描述',
        logo: 'test_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'merchant@example.com',
        address: '测试地址',
        businessLicense: 'test_license.jpg',
        idCardFront: 'test_front.jpg',
        idCardBack: 'test_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行'
      };

      const response = await request(app)
        .post('/api/merchants/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(merchantData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('您已经是商家，无需重复申请');
    });
  });

  describe('GET /api/merchants/profile', () => {
    it('should get merchant profile', async () => {
      // 创建商家记录
      const merchant = await Merchant.create({
        userId: testUser.id,
        name: '测试商家',
        description: '测试描述',
        logo: 'test_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'merchant@example.com',
        address: '测试地址',
        businessLicense: 'test_license.jpg',
        idCardFront: 'test_front.jpg',
        idCardBack: 'test_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行',
        status: MerchantStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED
      });

      const response = await request(app)
        .get('/api/merchants/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('获取商家信息成功');
      expect(response.body.data.id).toBe(merchant.id);
      expect(response.body.data.name).toBe('测试商家');
    });

    it('should return 404 if merchant profile not found', async () => {
      // 删除现有商家记录
      await Merchant.destroy({ where: { userId: testUser.id } });

      const response = await request(app)
        .get('/api/merchants/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('商家信息不存在');
    });
  });

  describe('PUT /api/merchants/profile', () => {
    it('should update merchant profile', async () => {
      // 创建商家记录
      const merchant = await Merchant.create({
        userId: testUser.id,
        name: '原始商家名称',
        description: '原始描述',
        logo: 'original_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'merchant@example.com',
        address: '原始地址',
        businessLicense: 'test_license.jpg',
        idCardFront: 'test_front.jpg',
        idCardBack: 'test_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行',
        status: MerchantStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED
      });

      const updateData = {
        name: '更新后的商家名称',
        description: '更新后的描述',
        logo: 'updated_logo.jpg',
        banner: 'updated_banner.jpg',
        contactPhone: '13900139000',
        contactEmail: 'updated@example.com',
        address: '更新后的地址'
      };

      const response = await request(app)
        .put('/api/merchants/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('商家信息更新成功');
      expect(response.body.data.name).toBe('更新后的商家名称');
      expect(response.body.data.description).toBe('更新后的描述');
    });
  });

  describe('GET /api/merchants (Admin)', () => {
    it('should get merchant list for admin', async () => {
      // 创建多个商家记录
      await Merchant.bulkCreate([
        {
          userId: testUser.id,
          name: '商家1',
          description: '商家1描述',
          logo: 'logo1.jpg',
          contactPhone: '13800138001',
          contactEmail: 'merchant1@example.com',
          address: '地址1',
          businessLicense: 'license1.jpg',
          idCardFront: 'front1.jpg',
          idCardBack: 'back1.jpg',
          settlementAccount: '6222021234567890123',
          settlementBank: '中国工商银行',
          status: MerchantStatus.ACTIVE,
          verificationStatus: VerificationStatus.VERIFIED
        },
        {
          userId: testUser.id,
          name: '商家2',
          description: '商家2描述',
          logo: 'logo2.jpg',
          contactPhone: '13800138002',
          contactEmail: 'merchant2@example.com',
          address: '地址2',
          businessLicense: 'license2.jpg',
          idCardFront: 'front2.jpg',
          idCardBack: 'back2.jpg',
          settlementAccount: '6222021234567890124',
          settlementBank: '中国建设银行',
          status: MerchantStatus.PENDING,
          verificationStatus: VerificationStatus.PENDING
        }
      ]);

      const response = await request(app)
        .get('/api/merchants')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('获取商家列表成功');
      expect(response.body.data.merchants).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.merchants.length).toBeGreaterThan(0);
    });

    it('should filter merchants by status', async () => {
      const response = await request(app)
        .get('/api/merchants?status=active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.merchants.every(m => m.status === 'active')).toBe(true);
    });
  });

  describe('PUT /api/merchants/:id/verify (Admin)', () => {
    it('should verify merchant successfully', async () => {
      // 创建待审核的商家
      const merchant = await Merchant.create({
        userId: testUser.id,
        name: '待审核商家',
        description: '待审核描述',
        logo: 'pending_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'pending@example.com',
        address: '待审核地址',
        businessLicense: 'pending_license.jpg',
        idCardFront: 'pending_front.jpg',
        idCardBack: 'pending_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行',
        status: MerchantStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING
      });

      const verifyData = {
        status: MerchantStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        verificationRemark: '审核通过'
      };

      const response = await request(app)
        .put(`/api/merchants/${merchant.id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(verifyData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('商家审核完成');
      expect(response.body.data.status).toBe(MerchantStatus.ACTIVE);
      expect(response.body.data.verificationStatus).toBe(VerificationStatus.VERIFIED);
      expect(response.body.data.verificationRemark).toBe('审核通过');
    });

    it('should reject merchant verification', async () => {
      // 创建待审核的商家
      const merchant = await Merchant.create({
        userId: testUser.id,
        name: '被拒绝商家',
        description: '被拒绝描述',
        logo: 'rejected_logo.jpg',
        contactPhone: '13800138000',
        contactEmail: 'rejected@example.com',
        address: '被拒绝地址',
        businessLicense: 'rejected_license.jpg',
        idCardFront: 'rejected_front.jpg',
        idCardBack: 'rejected_back.jpg',
        settlementAccount: '6222021234567890123',
        settlementBank: '中国工商银行',
        status: MerchantStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING
      });

      const verifyData = {
        status: MerchantStatus.REJECTED,
        verificationStatus: VerificationStatus.REJECTED,
        verificationRemark: '资质不符合要求'
      };

      const response = await request(app)
        .put(`/api/merchants/${merchant.id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(verifyData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(MerchantStatus.REJECTED);
      expect(response.body.data.verificationStatus).toBe(VerificationStatus.REJECTED);
    });
  });

  describe('GET /api/merchants/stats', () => {
    it('should get merchant statistics', async () => {
      const response = await request(app)
        .get('/api/merchants/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('获取商家统计数据成功');
      expect(response.body.data.productStats).toBeDefined();
      expect(response.body.data.orderStats).toBeDefined();
      expect(response.body.data.dailyStats).toBeDefined();
    });
  });
}); 