#!/usr/bin/env node

const http = require('http');
const url = require('url');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:5000',
  timeout: 5000
};

// 测试用例
const securityTests = [
  {
    name: '安全头检查',
    method: 'GET',
    path: '/api/security/health',
    expectedHeaders: [
      'X-Content-Type-Options',
      'X-Frame-Options', 
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy'
    ]
  },
  {
    name: 'CORS配置检查',
    method: 'OPTIONS',
    path: '/api/security/config',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type'
    },
    expectedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers'
    ]
  },
  {
    name: 'SQL注入防护测试',
    method: 'POST',
    path: '/api/security/sanitize-input',
    body: JSON.stringify({
      input: "'; DROP TABLE users; --"
    }),
    expectedStatus: 400
  },
  {
    name: 'XSS防护测试',
    method: 'POST',
    path: '/api/security/sanitize-input',
    body: JSON.stringify({
      input: '<script>alert("xss")</script>'
    }),
    expectedStatus: 400
  },
  {
    name: '路径遍历防护测试',
    method: 'GET',
    path: '/api/security/config?file=../../../etc/passwd',
    expectedStatus: 400
  },
  {
    name: '密码强度检查 - 弱密码',
    method: 'POST',
    path: '/api/security/check-password',
    body: JSON.stringify({
      password: '123456'
    }),
    expectedStatus: 200
  },
  {
    name: '密码强度检查 - 强密码',
    method: 'POST',
    path: '/api/security/check-password',
    body: JSON.stringify({
      password: 'StrongP@ssw0rd123!'
    }),
    expectedStatus: 200
  },
  {
    name: '令牌生成测试',
    method: 'POST',
    path: '/api/security/generate-token',
    expectedStatus: 200
  },
  {
    name: '密码哈希测试',
    method: 'POST',
    path: '/api/security/hash-password',
    body: JSON.stringify({
      password: 'testpassword123'
    }),
    expectedStatus: 200
  },
  {
    name: '速率限制测试',
    method: 'GET',
    path: '/api/security/scan',
    repeat: 10,
    expectedStatus: 429
  }
];

// 安全加固测试
const hardeningTests = [
  {
    name: '文件上传安全检查',
    method: 'POST',
    path: '/api/upload',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: 'malicious_file.exe',
    expectedStatus: 400
  },
  {
    name: '会话安全测试',
    method: 'GET',
    path: '/api/user/profile',
    headers: {
      'Cookie': 'sessionId=invalid_session'
    },
    expectedStatus: 401
  },
  {
    name: '权限检查测试',
    method: 'GET',
    path: '/api/admin/users',
    headers: {
      'Authorization': 'Bearer invalid_token'
    },
    expectedStatus: 401
  },
  {
    name: '输入验证测试',
    method: 'POST',
    path: '/api/auth/login',
    body: JSON.stringify({
      email: 'test@example.com<script>alert("xss")</script>',
      password: 'password123'
    }),
    expectedStatus: 400
  },
  {
    name: '恶意User-Agent检测',
    method: 'GET',
    path: '/api/security/scan',
    headers: {
      'User-Agent': 'sqlmap/1.0'
    },
    expectedStatus: 403
  }
];

// 安全配置测试
const configTests = [
  {
    name: '安全配置信息',
    method: 'GET',
    path: '/api/security/config',
    expectedStatus: 200
  },
  {
    name: '安全事件列表',
    method: 'GET',
    path: '/api/security/events',
    expectedStatus: 200
  },
  {
    name: '被阻止IP列表',
    method: 'GET',
    path: '/api/security/blocked-ips',
    expectedStatus: 200
  }
];

// 执行测试
async function runSecurityTest(test) {
  return new Promise((resolve) => {
    const parsedUrl = url.parse(TEST_CONFIG.baseUrl + test.path);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        ...test.headers
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let result = {
          name: test.name,
          status: res.statusCode,
          success: res.statusCode === test.expectedStatus,
          headers: res.headers,
          data: data
        };

        // 检查安全头
        if (test.expectedHeaders) {
          result.securityHeaders = {};
          test.expectedHeaders.forEach(header => {
            result.securityHeaders[header] = res.headers[header.toLowerCase()];
          });
        }

        resolve(result);
      });
    });

    req.on('error', (err) => {
      resolve({
        name: test.name,
        error: err.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: test.name,
        error: '请求超时',
        success: false
      });
    });

    if (test.body) {
      req.write(test.body);
    }

    req.end();
  });
}

// 执行速率限制测试
async function runRateLimitTest(test) {
  const results = [];
  
  for (let i = 0; i < test.repeat; i++) {
    const result = await runSecurityTest({
      ...test,
      name: `${test.name} (${i + 1}/${test.repeat})`
    });
    results.push(result);
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// 主测试函数
async function runSecurityHardeningTests() {
  console.log('🔒 开始安全加固测试...\n');

  const allTests = [
    ...securityTests,
    ...hardeningTests,
    ...configTests
  ];

  const results = [];

  for (const test of allTests) {
    console.log(`测试: ${test.name}`);
    
    if (test.repeat) {
      const rateLimitResults = await runRateLimitTest(test);
      results.push(...rateLimitResults);
    } else {
      const result = await runSecurityTest(test);
      results.push(result);
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 生成测试报告
  generateSecurityReport(results);
}

// 生成安全测试报告
function generateSecurityReport(results) {
  console.log('\n📊 安全加固测试报告');
  console.log('=' .repeat(50));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`总测试数: ${total}`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n🔍 详细结果:');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    
    if (!result.success) {
      console.log(`   状态码: ${result.status || 'N/A'}`);
      console.log(`   错误: ${result.error || 'N/A'}`);
    }
    
    if (result.securityHeaders) {
      console.log('   安全头:');
      Object.entries(result.securityHeaders).forEach(([header, value]) => {
        console.log(`     ${header}: ${value || '未设置'}`);
      });
    }
  });

  // 安全建议
  console.log('\n💡 安全建议:');
  if (failed > 0) {
    console.log('- 检查安全中间件配置');
    console.log('- 验证输入验证规则');
    console.log('- 确认安全头设置');
    console.log('- 测试速率限制功能');
  } else {
    console.log('- 所有安全测试通过');
    console.log('- 建议定期进行安全扫描');
    console.log('- 保持安全补丁更新');
  }

  console.log('\n🛡️ 安全加固完成!');
}

// 运行测试
if (require.main === module) {
  runSecurityHardeningTests().catch(console.error);
}

module.exports = {
  runSecurityHardeningTests,
  securityTests,
  hardeningTests,
  configTests
}; 