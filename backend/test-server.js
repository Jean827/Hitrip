const http = require('http');
const url = require('url');

const PORT = 5001;

// 模拟用户数据库
const users = [];

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // 健康检查
  if (path === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString() 
    }));
    return;
  }

  // 注册接口
  if (path === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, email, password, phone, nickname } = JSON.parse(body);

        // 验证必填字段
        if (!username || !email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: '用户名、邮箱和密码是必填项'
          }));
          return;
        }

        // 检查用户是否已存在
        const existingUser = users.find(user => 
          user.username === username || user.email === email
        );

        if (existingUser) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: '用户名或邮箱已存在'
          }));
          return;
        }

        // 创建新用户（简化版，不加密密码）
        const newUser = {
          id: users.length + 1,
          username,
          email,
          password, // 注意：实际应用中应该加密
          phone: phone || '',
          nickname: nickname || '',
          isEmailVerified: false,
          isPhoneVerified: false,
          role: 'user',
          status: 'active',
          points: 0,
          level: 1,
          vipLevel: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        users.push(newUser);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '注册成功',
          data: {
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              nickname: newUser.nickname,
              role: newUser.role,
              isEmailVerified: newUser.isEmailVerified,
              isPhoneVerified: newUser.isPhoneVerified
            },
            token: 'mock-token-' + newUser.id,
            refreshToken: 'mock-refresh-token-' + newUser.id
          }
        }));
      } catch (error) {
        console.error('注册错误:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '服务器内部错误'
        }));
      }
    });
    return;
  }

  // 登录接口
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { identifier, password } = JSON.parse(body);

        if (!identifier || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: '用户名/邮箱和密码是必填项'
          }));
          return;
        }

        // 查找用户
        const user = users.find(u => 
          u.username === identifier || u.email === identifier
        );

        if (!user || user.password !== password) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: '用户名或密码错误'
          }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '登录成功',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              nickname: user.nickname,
              role: user.role,
              isEmailVerified: user.isEmailVerified,
              isPhoneVerified: user.isPhoneVerified
            },
            token: 'mock-token-' + user.id,
            refreshToken: 'mock-refresh-token-' + user.id
          }
        }));
      } catch (error) {
        console.error('登录错误:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '服务器内部错误'
        }));
      }
    });
    return;
  }

  // 404处理
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: '接口不存在' }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 测试服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📝 注册接口: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 登录接口: POST http://localhost:${PORT}/api/auth/login`);
}); 