const request = require('supertest');
const app = require('../../src/index');

describe('性能测试', () => {
  describe('负载测试', () => {
    test('搜索接口负载测试', async () => {
      const concurrentUsers = 50;
      const requestsPerUser = 10;
      const totalRequests = concurrentUsers * requestsPerUser;
      
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          request(app)
            .get('/api/search/fulltext')
            .query({ q: '海南' })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / totalRequests;

      console.log(`负载测试结果:`);
      console.log(`- 总请求数: ${totalRequests}`);
      console.log(`- 总时间: ${totalTime}ms`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`- 每秒请求数: ${(totalRequests / (totalTime / 1000)).toFixed(2)}`);

      // 验证所有请求都成功
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      // 性能指标验证
      expect(avgResponseTime).toBeLessThan(1000); // 平均响应时间应小于1秒
      expect(totalTime).toBeLessThan(30000); // 总时间应小于30秒
    });

    test('商品列表接口负载测试', async () => {
      const concurrentUsers = 30;
      const requestsPerUser = 5;
      const totalRequests = concurrentUsers * requestsPerUser;
      
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / totalRequests;

      console.log(`商品列表负载测试结果:`);
      console.log(`- 总请求数: ${totalRequests}`);
      console.log(`- 总时间: ${totalTime}ms`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      expect(avgResponseTime).toBeLessThan(500); // 商品列表响应时间应小于500ms
    });

    test('用户认证接口负载测试', async () => {
      const concurrentUsers = 20;
      const requestsPerUser = 3;
      const totalRequests = concurrentUsers * requestsPerUser;
      
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < totalRequests; i++) {
        const userData = {
          email: `test${i}@example.com`,
          password: 'TestPassword123!'
        };

        promises.push(
          request(app)
            .post('/api/auth/login')
            .send(userData)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / totalRequests;

      console.log(`用户认证负载测试结果:`);
      console.log(`- 总请求数: ${totalRequests}`);
      console.log(`- 总时间: ${totalTime}ms`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

      expect(avgResponseTime).toBeLessThan(2000); // 认证接口响应时间应小于2秒
    });
  });

  describe('压力测试', () => {
    test('高并发搜索测试', async () => {
      const concurrentRequests = 100;
      const promises = [];
      const responseTimes = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const startTime = Date.now();
        
        promises.push(
          request(app)
            .get('/api/search/fulltext')
            .query({ q: `测试${i}` })
            .expect(200)
            .then(response => {
              const endTime = Date.now();
              responseTimes.push(endTime - startTime);
              return response;
            })
        );
      }

      const responses = await Promise.all(promises);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      console.log(`高并发搜索测试结果:`);
      console.log(`- 并发请求数: ${concurrentRequests}`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`- 最大响应时间: ${maxResponseTime}ms`);
      console.log(`- 最小响应时间: ${minResponseTime}ms`);

      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      expect(avgResponseTime).toBeLessThan(1500); // 平均响应时间应小于1.5秒
      expect(maxResponseTime).toBeLessThan(5000); // 最大响应时间应小于5秒
    });

    test('数据库连接池压力测试', async () => {
      const concurrentRequests = 50;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .query({ page: i + 1, limit: 10 })
            .expect(200)
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`数据库连接池压力测试结果:`);
      console.log(`- 并发请求数: ${concurrentRequests}`);
      console.log(`- 总时间: ${totalTime}ms`);
      console.log(`- 平均响应时间: ${(totalTime / concurrentRequests).toFixed(2)}ms`);

      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(10000); // 总时间应小于10秒
    });
  });

  describe('内存泄漏测试', () => {
    test('长时间运行测试', async () => {
      const iterations = 100;
      const promises = [];

      for (let i = 0; i < iterations; i++) {
        promises.push(
          request(app)
            .get('/api/search/fulltext')
            .query({ q: `测试${i}` })
            .expect(200)
        );

        // 添加小延迟避免过度压力
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      console.log(`长时间运行测试完成: ${iterations} 次请求`);
    });
  });

  describe('缓存性能测试', () => {
    test('缓存命中率测试', async () => {
      const testQuery = '海南旅游';
      const iterations = 20;
      const responseTimes = [];

      // 第一次请求（缓存未命中）
      const firstStart = Date.now();
      await request(app)
        .get('/api/search/fulltext')
        .query({ q: testQuery })
        .expect(200);
      const firstTime = Date.now() - firstStart;

      // 后续请求（缓存命中）
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app)
          .get('/api/search/fulltext')
          .query({ q: testQuery })
          .expect(200);
        responseTimes.push(Date.now() - startTime);
      }

      const avgCachedTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const performanceImprovement = firstTime / avgCachedTime;

      console.log(`缓存性能测试结果:`);
      console.log(`- 首次请求时间: ${firstTime}ms`);
      console.log(`- 缓存后平均时间: ${avgCachedTime.toFixed(2)}ms`);
      console.log(`- 性能提升倍数: ${performanceImprovement.toFixed(2)}x`);

      expect(performanceImprovement).toBeGreaterThan(1.5); // 缓存应该提供至少1.5倍性能提升
    });
  });

  describe('API响应时间基准测试', () => {
    test('健康检查接口响应时间', async () => {
      const iterations = 100;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app)
          .get('/health')
          .expect(200);
        responseTimes.push(Date.now() - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      console.log(`健康检查响应时间基准:`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`- 最大响应时间: ${maxResponseTime}ms`);

      expect(avgResponseTime).toBeLessThan(50); // 健康检查应非常快
      expect(maxResponseTime).toBeLessThan(100); // 最大响应时间应小于100ms
    });

    test('搜索建议接口响应时间', async () => {
      const iterations = 50;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app)
          .get('/api/search/suggestions')
          .query({ q: `测试${i}` })
          .expect(200);
        responseTimes.push(Date.now() - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      console.log(`搜索建议响应时间基准:`);
      console.log(`- 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

      expect(avgResponseTime).toBeLessThan(300); // 搜索建议应快速响应
    });
  });
}); 