const request = require('supertest');
const app = require('../src/index');
const { sequelize } = require('../src/config/sequelize');
const { User } = require('../src/models/User');
const { Product } = require('../src/models/Product');
const { Order } = require('../src/models/Order');
const { Payment } = require('../src/models/Payment');

describe('Performance Tests', () => {
  let testUsers = [];
  let testProducts = [];
  let authTokens = [];

  beforeAll(async () => {
    // 创建测试用户
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        username: `testuser${i}`,
        email: `test${i}@example.com`,
        password: 'password123',
        role: 'user'
      });
      testUsers.push(user);

      // 获取认证token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: `test${i}@example.com`,
          password: 'password123'
        });
      authTokens.push(loginResponse.body.token);
    }

    // 创建测试商品
    for (let i = 0; i < 20; i++) {
      const product = await Product.create({
        name: `测试商品${i}`,
        description: `这是测试商品${i}的描述`,
        price: 100 + i * 10,
        originalPrice: 120 + i * 10,
        categoryId: '1',
        images: [`product${i}.jpg`],
        tags: ['测试', '商品'],
        isActive: true,
        stock: 100,
        salesCount: 0,
        rating: 4.5
      });
      testProducts.push(product);
    }
  });

  afterAll(async () => {
    // 清理测试数据
    await Payment.destroy({ where: { userId: testUsers.map(u => u.id) } });
    await Order.destroy({ where: { userId: testUsers.map(u => u.id) } });
    await Product.destroy({ where: { id: testProducts.map(p => p.id) } });
    await User.destroy({ where: { id: testUsers.map(u => u.id) } });
    await sequelize.close();
  });

  describe('Product API Performance', () => {
    it('should handle concurrent product list requests', async () => {
      const startTime = Date.now();
      const concurrentRequests = 50;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Product list performance: ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / concurrentRequests}ms`);

      expect(responses.every(res => res.status === 200)).toBe(true);
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
    });

    it('should handle concurrent product search requests', async () => {
      const startTime = Date.now();
      const concurrentRequests = 30;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/products?search=测试')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Product search performance: ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / concurrentRequests}ms`);

      expect(responses.every(res => res.status === 200)).toBe(true);
      expect(totalTime).toBeLessThan(3000); // 3秒内完成
    });
  });

  describe('Order API Performance', () => {
    it('should handle concurrent order creation', async () => {
      const startTime = Date.now();
      const concurrentRequests = 20;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const orderData = {
          items: [
            {
              productId: testProducts[i % testProducts.length].id,
              quantity: 1,
              price: testProducts[i % testProducts.length].price
            }
          ],
          shippingAddress: {
            name: `Test User ${i}`,
            phone: '13800138000',
            province: '海南省',
            city: '海口市',
            district: '美兰区',
            address: `测试地址${i}`
          },
          paymentMethod: 'wechat',
          remark: `测试订单${i}`
        };

        promises.push(
          request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
            .send(orderData)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Order creation performance: ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / concurrentRequests}ms`);

      expect(responses.every(res => res.status === 200)).toBe(true);
      expect(totalTime).toBeLessThan(10000); // 10秒内完成
    });

    it('should handle concurrent order list requests', async () => {
      const startTime = Date.now();
      const concurrentRequests = 40;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Order list performance: ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / concurrentRequests}ms`);

      expect(responses.every(res => res.status === 200)).toBe(true);
      expect(totalTime).toBeLessThan(4000); // 4秒内完成
    });
  });

  describe('Payment API Performance', () => {
    it('should handle concurrent payment creation', async () => {
      // 先创建一些测试订单
      const testOrders = [];
      for (let i = 0; i < 10; i++) {
        const order = await Order.create({
          userId: testUsers[i % testUsers.length].id,
          orderNumber: `PERF${i}`,
          status: 'pending',
          totalAmount: 100.00,
          paymentAmount: 100.00,
          discountAmount: 0,
          shippingFee: 0,
          shippingAddress: {
            name: `Test User ${i}`,
            phone: '13800138000',
            province: '海南省',
            city: '海口市',
            district: '美兰区',
            address: `测试地址${i}`
          },
          paymentMethod: 'wechat',
          paymentStatus: 'pending'
        });
        testOrders.push(order);
      }

      const startTime = Date.now();
      const concurrentRequests = 15;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post('/api/payments')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
            .send({
              orderId: testOrders[i % testOrders.length].id,
              paymentMethod: 'wechat',
              amount: 100.00
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Payment creation performance: ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${totalTime / concurrentRequests}ms`);

      expect(responses.every(res => res.status === 200)).toBe(true);
      expect(totalTime).toBeLessThan(8000); // 8秒内完成

      // 清理测试订单
      await Order.destroy({ where: { id: testOrders.map(o => o.id) } });
    });
  });

  describe('Database Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      // 创建大量测试数据
      const bulkProducts = [];
      for (let i = 0; i < 100; i++) {
        bulkProducts.push({
          name: `批量商品${i}`,
          description: `这是批量商品${i}的描述`,
          price: 50 + i,
          originalPrice: 60 + i,
          categoryId: '1',
          images: [`bulk_product${i}.jpg`],
          tags: ['批量', '测试'],
          isActive: true,
          stock: 50,
          salesCount: Math.floor(Math.random() * 100),
          rating: 3.5 + Math.random() * 2
        });
      }

      await Product.bulkCreate(bulkProducts);

      const startTime = Date.now();
      
      // 执行复杂查询
      const response = await request(app)
        .get('/api/products?search=批量&minPrice=50&maxPrice=150&sort=price&order=asc&page=1&limit=50')
        .expect(200);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      console.log(`Complex query performance: completed in ${queryTime}ms`);
      expect(queryTime).toBeLessThan(2000); // 2秒内完成
      expect(response.body.data.products.length).toBeGreaterThan(0);

      // 清理批量数据
      await Product.destroy({ where: { name: { $like: '批量商品%' } } });
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      // 测试分页性能
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        promises.push(
          request(app)
            .get(`/api/products?page=${i}&limit=10`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Pagination performance: 5 pages completed in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(3000); // 3秒内完成
      expect(responses.every(res => res.status === 200)).toBe(true);
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks during concurrent operations', async () => {
      const initialMemory = process.memoryUsage();
      console.log('Initial memory usage:', initialMemory);

      // 执行大量并发操作
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .expect(200)
        );
      }

      await Promise.all(promises);

      const finalMemory = process.memoryUsage();
      console.log('Final memory usage:', finalMemory);

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      console.log('Memory increase:', memoryIncrease);

      // 内存增长应该在合理范围内（小于100MB）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Response Time Consistency', () => {
    it('should maintain consistent response times', async () => {
      const responseTimes = [];
      const numRequests = 20;

      for (let i = 0; i < numRequests; i++) {
        const startTime = Date.now();
        
        await request(app)
          .get('/api/products')
          .expect(200);

        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const variance = responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;

      console.log(`Response time statistics:`);
      console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Min: ${minResponseTime}ms`);
      console.log(`Max: ${maxResponseTime}ms`);
      console.log(`Variance: ${variance.toFixed(2)}`);

      // 响应时间应该在合理范围内
      expect(avgResponseTime).toBeLessThan(500); // 平均响应时间小于500ms
      expect(maxResponseTime).toBeLessThan(1000); // 最大响应时间小于1秒
      expect(variance).toBeLessThan(10000); // 方差应该较小，表示响应时间稳定
    });
  });
}); 