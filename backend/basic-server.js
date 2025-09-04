const http = require('http');
const { parse } = require('url');
const { createHash } = require('crypto');

const PORT = 5001;

// 模拟用户数据
const users = [];

// 简单的JWT实现（仅用于演示）
function generateToken(userId, username) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHash('sha256')
    .update(`${encodedHeader}.${encodedPayload}.your-simple-secret`)
    .digest('hex');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 简单的密码哈希（仅用于演示）
function hashPassword(password) {
  return createHash('sha256').update(password + 'simple-salt').digest('hex');
}

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const { pathname } = parse(req.url, true);
  
  // 健康检查
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 用户注册
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await parseBody(req);
    const { username, email, password } = body;
    
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
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    const token = generateToken(newUser.id, newUser.username);
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        token
      }
    }));
    return;
  }
  
  // 用户登录
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const { identifier, password } = body;
    
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
    
    if (!user || user.password !== hashPassword(password)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: '用户名或密码错误'
      }));
      return;
    }
    
    const token = generateToken(user.id, user.username);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    }));
    return;
  }
  
  // 获取用户资料
  if (pathname === '/api/user/profile' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: '未授权'
      }));
      return;
    }
    
    // 简化的验证逻辑
    // 在实际应用中应该验证token的有效性
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        id: 1,
        username: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: 'https://via.placeholder.com/150',
        phone: '13800138000',
        createdAt: '2023-01-01T00:00:00Z'
      }
    }));
    return;
  }
  
  // 404 未找到
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    message: '资源未找到'
  }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`基础服务器运行在 http://localhost:${PORT}`);
  console.log('健康检查: http://localhost:5001/health');
  console.log('注册接口: POST http://localhost:5001/api/auth/register');
  console.log('登录接口: POST http://localhost:5001/api/auth/login');
  console.log('用户资料: GET http://localhost:5001/api/user/profile');
});