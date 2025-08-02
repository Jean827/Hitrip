const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5001;

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

  // 设置响应头
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // 路由处理
  switch (path) {
    case '/health':
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Hainan Tourism API',
        version: '1.0.0'
      }));
      break;

    case '/api/status':
      res.writeHead(200);
      res.end(JSON.stringify({
        services: {
          frontend: { status: 'running', port: 3000 },
          backend: { status: 'running', port: 5001 },
          database: { status: 'running', port: 5432 },
          redis: { status: 'running', port: 6379 }
        },
        modules: {
          'user-system': { status: 'completed', progress: 100 },
          'portal-website': { status: 'completed', progress: 100 },
          'shop-system': { status: 'completed', progress: 100 },
          'smart-features': { status: 'completed', progress: 100 },
          'admin-panel': { status: 'completed', progress: 100 },
          'security': { status: 'completed', progress: 100 },
          'monitoring': { status: 'completed', progress: 100 }
        }
      }));
      break;

    case '/api/users':
      res.writeHead(200);
      res.end(JSON.stringify({
        users: [
          { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user' },
          { id: 2, name: '李四', email: 'lisi@example.com', role: 'admin' },
          { id: 3, name: '王五', email: 'wangwu@example.com', role: 'user' }
        ],
        total: 3
      }));
      break;

    case '/api/attractions':
      res.writeHead(200);
      res.end(JSON.stringify({
        attractions: [
          { id: 1, name: '天涯海角', location: '三亚市', rating: 4.5 },
          { id: 2, name: '南山寺', location: '三亚市', rating: 4.3 },
          { id: 3, name: '亚龙湾', location: '三亚市', rating: 4.7 }
        ],
        total: 3
      }));
      break;

    case '/api/orders':
      res.writeHead(200);
      res.end(JSON.stringify({
        orders: [
          { id: 1, user: '张三', amount: 299, status: 'completed' },
          { id: 2, user: '李四', amount: 599, status: 'pending' },
          { id: 3, user: '王五', amount: 199, status: 'processing' }
        ],
        total: 3
      }));
      break;

    default:
      res.writeHead(404);
      res.end(JSON.stringify({ message: '接口不存在' }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📈 状态API: http://localhost:${PORT}/api/status`);
  console.log(`👥 用户API: http://localhost:${PORT}/api/users`);
  console.log(`🏖️ 景点API: http://localhost:${PORT}/api/attractions`);
  console.log(`📦 订单API: http://localhost:${PORT}/api/orders`);
});

module.exports = server; 