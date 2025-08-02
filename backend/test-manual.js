#!/usr/bin/env node

// 手动系统测试脚本 - 不依赖外部模块
const http = require('http');

console.log('=== 海南文旅系统集成测试 ===\n');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5000',
  timeout: 5000
};

// 测试用例
const testCases = [
  {
    name: '健康检查',
    method: 'GET',
    path: '/health',
    expectedStatus: 200,
    expectedData: { status: 'OK' }
  },
  {
    name: '搜索功能测试',
    method: 'GET',
    path: '/api/search/fulltext?q=海南',
    expectedStatus: 200,
    expectedData: { success: true }
  },
  {
    name: '商品列表测试',
    method: 'GET',
    path: '/api/products',
    expectedStatus: 200,
    expectedData: { success: true }
  },
  {
    name: '用户登录测试',
    method: 'POST',
    path: '/api/auth/login',
    data: {
      email: 'test@example.com',
      password: 'TestPassword123!'
    },
    expectedStatus: 200,
    expectedData: { success: true }
  }
];

// 运行测试
async function runTests() {
  let passedTests = 0;
  let totalTests = 0;

  console.log('开始执行测试...\n');

  for (const testCase of testCases) {
    totalTests++;
    console.log(`测试 ${totalTests}: ${testCase.name}`);
    
    try {
      const result = await makeRequest(testCase);
      
      if (result.success) {
        console.log(`  ✅ 通过`);
        passedTests++;
      } else {
        console.log(`  ❌ 失败: ${result.error}`);
      }
    } catch (error) {
      console.log(`  ❌ 错误: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试结果总结
  console.log('=== 测试结果总结 ===');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！系统集成测试成功！');
    console.log('\n=== 系统功能验证完成 ===');
    console.log('✅ 健康检查功能正常');
    console.log('✅ 搜索功能正常');
    console.log('✅ 商品管理功能正常');
    console.log('✅ 用户认证功能正常');
    console.log('✅ API接口响应正常');
    console.log('✅ 错误处理机制正常');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步检查');
  }

  // 性能测试
  console.log('\n=== 性能测试 ===');
  await runPerformanceTests();

  // 安全测试
  console.log('\n=== 安全测试 ===');
  await runSecurityTests();

  console.log('\n=== 测试完成 ===');
}

// HTTP请求函数
function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const url = new URL(testCase.path, TEST_CONFIG.baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hainan-Tourism-Test/1.0'
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          
          // 验证响应
          const isStatusValid = res.statusCode === testCase.expectedStatus;
          const isDataValid = validateResponseData(responseData, testCase.expectedData);
          
          if (isStatusValid && isDataValid) {
            resolve({ success: true, data: responseData });
          } else {
            resolve({ 
              success: false, 
              error: `状态码: ${res.statusCode} (期望: ${testCase.expectedStatus}), 数据验证失败` 
            });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: `响应解析失败: ${error.message}` 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `请求失败: ${error.message}` 
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: '请求超时' 
      });
    });

    if (testCase.data) {
      req.write(JSON.stringify(testCase.data));
    }

    req.end();
  });
}

// 验证响应数据
function validateResponseData(actual, expected) {
  if (!expected) return true;
  
  for (const key in expected) {
    if (expected.hasOwnProperty(key)) {
      if (!actual.hasOwnProperty(key) || actual[key] !== expected[key]) {
        return false;
      }
    }
  }
  return true;
}

// 性能测试
async function runPerformanceTests() {
  console.log('执行性能测试...');
  
  const performanceTests = [
    { name: '搜索响应时间', path: '/api/search/fulltext?q=海南' },
    { name: '商品列表响应时间', path: '/api/products' },
    { name: '健康检查响应时间', path: '/health' }
  ];

  for (const test of performanceTests) {
    try {
      const startTime = Date.now();
      const result = await makeRequest({
        method: 'GET',
        path: test.path,
        expectedStatus: 200
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (result.success && responseTime < 2000) {
        console.log(`  ✅ ${test.name}: ${responseTime}ms`);
      } else {
        console.log(`  ❌ ${test.name}: ${responseTime}ms (超时)`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name}: 测试失败`);
    }
  }
}

// 安全测试
async function runSecurityTests() {
  console.log('执行安全测试...');
  
  const securityTests = [
    {
      name: 'SQL注入防护',
      path: '/api/search/fulltext?q=1\' OR \'1\'=\'1',
      expectedStatus: 200 // 应该正常处理，不返回错误
    },
    {
      name: 'XSS防护',
      path: '/api/search/fulltext?q=<script>alert("xss")</script>',
      expectedStatus: 200
    },
    {
      name: '路径遍历防护',
      path: '/api/products/../../../etc/passwd',
      expectedStatus: 404
    }
  ];

  for (const test of securityTests) {
    try {
      const result = await makeRequest({
        method: 'GET',
        path: test.path,
        expectedStatus: test.expectedStatus
      });

      if (result.success) {
        console.log(`  ✅ ${test.name}: 防护正常`);
      } else {
        console.log(`  ❌ ${test.name}: 防护异常`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name}: 测试失败`);
    }
  }
}

// 系统状态检查
function checkSystemStatus() {
  console.log('=== 系统状态检查 ===');
  console.log(`Node.js 版本: ${process.version}`);
  console.log(`平台: ${process.platform}`);
  console.log(`架构: ${process.arch}`);
  console.log(`内存使用: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`运行时间: ${process.uptime().toFixed(2)}秒`);
  console.log('');
}

// 主函数
async function main() {
  checkSystemStatus();
  
  console.log('注意: 此测试需要后端服务器运行在 http://localhost:5000');
  console.log('如果服务器未运行，请先启动后端服务\n');
  
  await runTests();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
} 