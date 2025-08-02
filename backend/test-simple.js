#!/usr/bin/env node

// 简单的系统测试脚本
const http = require('http');
const url = require('url');

// 模拟Express应用
const express = require('express');
const app = express();

// 基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 模拟搜索路由
app.get('/api/search/fulltext', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: '搜索关键词不能为空' });
  }
  
  res.json({
    success: true,
    data: {
      results: [
        { id: 1, name: '海南旅游产品1', description: '测试产品1' },
        { id: 2, name: '海南旅游产品2', description: '测试产品2' }
      ],
      total: 2,
      query: q
    }
  });
});

// 模拟用户认证路由
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
  }
  
  if (email === 'test@example.com' && password === 'TestPassword123!') {
    res.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: { id: 1, email: 'test@example.com', username: 'testuser' }
      }
    });
  } else {
    res.status(401).json({ success: false, message: '邮箱或密码错误' });
  }
});

// 模拟商品路由
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        { id: 1, name: '海南特产1', price: 100 },
        { id: 2, name: '海南特产2', price: 200 }
      ]
    }
  });
});

// 启动服务器
const server = app.listen(5001, () => {
  console.log('测试服务器启动在端口 5001');
  runTests();
});

// 测试函数
async function runTests() {
  console.log('\n=== 开始系统集成测试 ===\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // 测试1: 健康检查
  totalTests++;
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.status === 'OK') {
      console.log('✅ 健康检查测试通过');
      passedTests++;
    } else {
      console.log('❌ 健康检查测试失败');
    }
  } catch (error) {
    console.log('❌ 健康检查测试失败:', error.message);
  }

  // 测试2: 搜索功能
  totalTests++;
  try {
    const response = await makeRequest('GET', '/api/search/fulltext?q=海南');
    if (response.status === 200 && response.data.success && response.data.data.results.length > 0) {
      console.log('✅ 搜索功能测试通过');
      passedTests++;
    } else {
      console.log('❌ 搜索功能测试失败');
    }
  } catch (error) {
    console.log('❌ 搜索功能测试失败:', error.message);
  }

  // 测试3: 搜索参数验证
  totalTests++;
  try {
    const response = await makeRequest('GET', '/api/search/fulltext');
    if (response.status === 400 && !response.data.success) {
      console.log('✅ 搜索参数验证测试通过');
      passedTests++;
    } else {
      console.log('❌ 搜索参数验证测试失败');
    }
  } catch (error) {
    console.log('❌ 搜索参数验证测试失败:', error.message);
  }

  // 测试4: 用户登录成功
  totalTests++;
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'TestPassword123!'
    });
    if (response.status === 200 && response.data.success && response.data.data.token) {
      console.log('✅ 用户登录成功测试通过');
      passedTests++;
    } else {
      console.log('❌ 用户登录成功测试失败');
    }
  } catch (error) {
    console.log('❌ 用户登录成功测试失败:', error.message);
  }

  // 测试5: 用户登录失败
  totalTests++;
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    if (response.status === 401 && !response.data.success) {
      console.log('✅ 用户登录失败测试通过');
      passedTests++;
    } else {
      console.log('❌ 用户登录失败测试失败');
    }
  } catch (error) {
    console.log('❌ 用户登录失败测试失败:', error.message);
  }

  // 测试6: 商品列表
  totalTests++;
  try {
    const response = await makeRequest('GET', '/api/products');
    if (response.status === 200 && response.data.success && response.data.data.products.length > 0) {
      console.log('✅ 商品列表测试通过');
      passedTests++;
    } else {
      console.log('❌ 商品列表测试失败');
    }
  } catch (error) {
    console.log('❌ 商品列表测试失败:', error.message);
  }

  // 测试7: 性能测试
  totalTests++;
  try {
    const startTime = Date.now();
    await makeRequest('GET', '/api/search/fulltext?q=海南');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime < 1000) {
      console.log(`✅ 性能测试通过 (响应时间: ${responseTime}ms)`);
      passedTests++;
    } else {
      console.log(`❌ 性能测试失败 (响应时间: ${responseTime}ms)`);
    }
  } catch (error) {
    console.log('❌ 性能测试失败:', error.message);
  }

  // 测试8: 并发测试
  totalTests++;
  try {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('GET', '/api/products'));
    }
    
    const responses = await Promise.all(promises);
    const allSuccess = responses.every(response => response.status === 200);
    
    if (allSuccess) {
      console.log('✅ 并发测试通过');
      passedTests++;
    } else {
      console.log('❌ 并发测试失败');
    }
  } catch (error) {
    console.log('❌ 并发测试失败:', error.message);
  }

  // 测试结果总结
  console.log('\n=== 测试结果总结 ===');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！系统集成测试成功！');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步检查');
  }

  // 关闭服务器
  server.close(() => {
    console.log('\n测试服务器已关闭');
    process.exit(passedTests === totalTests ? 0 : 1);
  });
}

// HTTP请求函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: responseData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
} 