const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/sequelize');
const { Payment, PaymentStatus, PaymentMethod } = require('../src/models/Payment');
const { Order, OrderStatus } = require('../src/models/Order');
const { User } = require('../src/models/User');

describe('Payment API Tests', () => {
  let testUser;
  let testOrder;
  let authToken;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

    // 创建测试订单
    testOrder = await Order.create({
      userId: testUser.id,
      orderNumber: 'TEST001',
      status: OrderStatus.PENDING,
      totalAmount: 100.00,
      paymentAmount: 100.00,
      discountAmount: 0,
      shippingFee: 0,
      shippingAddress: {
        name: 'Test User',
        phone: '13800138000',
        province: '海南省',
        city: '海口市',
        district: '美兰区',
        address: '测试地址'
      },
      paymentMethod: PaymentMethod.WECHAT,
      paymentStatus: 'pending'
    });

    // 获取认证token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // 清理测试数据
    await Payment.destroy({ where: { userId: testUser.id } });
    await Order.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    await sequelize.close();
  });

  describe('POST /api/payments', () => {
    it('should create a new payment', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          paymentMethod: PaymentMethod.WECHAT,
          amount: 100.00
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('支付创建成功');
      expect(response.body.data.paymentId).toBeDefined();
      expect(response.body.data.paymentParams).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'non-existent-id',
          paymentMethod: PaymentMethod.WECHAT,
          amount: 100.00
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('订单不存在');
    });

    it('should return 400 for invalid payment method', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          paymentMethod: 'invalid_method',
          amount: 100.00
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('不支持的支付方式');
    });
  });

  describe('POST /api/payments/callback/:paymentMethod', () => {
    it('should handle wechat payment callback successfully', async () => {
      // 先创建一个支付记录
      const payment = await Payment.create({
        orderId: testOrder.id,
        userId: testUser.id,
        paymentMethod: PaymentMethod.WECHAT,
        amount: 100.00,
        status: PaymentStatus.PENDING,
        transactionId: 'test_transaction_id'
      });

      const callbackData = {
        transaction_id: 'test_transaction_id',
        result_code: 'SUCCESS',
        total_fee: 10000 // 微信支付金额以分为单位
      };

      const response = await request(app)
        .post('/api/payments/callback/wechat')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('回调处理成功');

      // 验证支付状态已更新
      const updatedPayment = await Payment.findByPk(payment.id);
      expect(updatedPayment.status).toBe(PaymentStatus.PAID);
      expect(updatedPayment.paymentTime).toBeDefined();

      // 验证订单状态已更新
      const updatedOrder = await Order.findByPk(testOrder.id);
      expect(updatedOrder.status).toBe(OrderStatus.PAID);
      expect(updatedOrder.paymentStatus).toBe('paid');
    });

    it('should handle failed payment callback', async () => {
      const payment = await Payment.create({
        orderId: testOrder.id,
        userId: testUser.id,
        paymentMethod: PaymentMethod.WECHAT,
        amount: 100.00,
        status: PaymentStatus.PENDING,
        transactionId: 'failed_transaction_id'
      });

      const callbackData = {
        transaction_id: 'failed_transaction_id',
        result_code: 'FAIL',
        total_fee: 10000
      };

      const response = await request(app)
        .post('/api/payments/callback/wechat')
        .send(callbackData);

      expect(response.status).toBe(200);

      // 验证支付状态已更新为失败
      const updatedPayment = await Payment.findByPk(payment.id);
      expect(updatedPayment.status).toBe(PaymentStatus.FAILED);
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should process refund successfully', async () => {
      // 创建一个已支付的支付记录
      const payment = await Payment.create({
        orderId: testOrder.id,
        userId: testUser.id,
        paymentMethod: PaymentMethod.WECHAT,
        amount: 100.00,
        status: PaymentStatus.PAID,
        transactionId: 'refund_test_id',
        paymentTime: new Date()
      });

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentId: payment.id,
          refundAmount: 50.00,
          refundReason: '部分退款测试'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('退款申请成功');
      expect(response.body.data.refundId).toBeDefined();

      // 验证退款状态
      const updatedPayment = await Payment.findByPk(payment.id);
      expect(updatedPayment.status).toBe(PaymentStatus.PARTIAL_REFUNDED);
      expect(updatedPayment.refundAmount).toBe(50.00);
      expect(updatedPayment.refundReason).toBe('部分退款测试');
    });

    it('should return 400 for invalid refund amount', async () => {
      const payment = await Payment.create({
        orderId: testOrder.id,
        userId: testUser.id,
        paymentMethod: PaymentMethod.WECHAT,
        amount: 100.00,
        status: PaymentStatus.PAID,
        transactionId: 'refund_invalid_id',
        paymentTime: new Date()
      });

      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentId: payment.id,
          refundAmount: 150.00, // 超过支付金额
          refundReason: '退款金额超过支付金额'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('退款金额不能大于支付金额');
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should get payment details', async () => {
      const payment = await Payment.create({
        orderId: testOrder.id,
        userId: testUser.id,
        paymentMethod: PaymentMethod.WECHAT,
        amount: 100.00,
        status: PaymentStatus.PAID,
        transactionId: 'detail_test_id'
      });

      const response = await request(app)
        .get(`/api/payments/${payment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('获取支付详情成功');
      expect(response.body.data.id).toBe(payment.id);
      expect(response.body.data.amount).toBe(100.00);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('支付记录不存在');
    });
  });

  describe('GET /api/payments', () => {
    it('should get user payment list', async () => {
      // 创建多个支付记录
      await Payment.bulkCreate([
        {
          orderId: testOrder.id,
          userId: testUser.id,
          paymentMethod: PaymentMethod.WECHAT,
          amount: 100.00,
          status: PaymentStatus.PAID,
          transactionId: 'list_test_1'
        },
        {
          orderId: testOrder.id,
          userId: testUser.id,
          paymentMethod: PaymentMethod.ALIPAY,
          amount: 200.00,
          status: PaymentStatus.PAID,
          transactionId: 'list_test_2'
        }
      ]);

      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('获取支付记录成功');
      expect(response.body.data.payments).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.payments.length).toBeGreaterThan(0);
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/payments?status=paid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.payments.every(p => p.status === 'paid')).toBe(true);
    });
  });
}); 