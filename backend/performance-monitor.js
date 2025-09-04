const http = require('http');
const { parse } = require('url');

const PORT = 5002;

// 服务器性能数据收集
const performanceData = {
  requests: 0,
  errors: 0,
  totalResponseTime: 0,
  startTime: Date.now(),
  requestStats: {},
  memoryUsageHistory: [],
  cpuUsageHistory: []
};

// 收集内存使用情况
function collectMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  performanceData.memoryUsageHistory.push({
    timestamp: new Date().toISOString(),
    rss: memoryUsage.rss,
    heapTotal: memoryUsage.heapTotal,
    heapUsed: memoryUsage.heapUsed,
    external: memoryUsage.external
  });
  
  // 只保留最近100个数据点
  if (performanceData.memoryUsageHistory.length > 100) {
    performanceData.memoryUsageHistory.shift();
  }
}

// 定期收集性能数据
setInterval(collectMemoryUsage, 5000);

// 记录请求统计
function recordRequestStats(path, statusCode, responseTime) {
  if (!performanceData.requestStats[path]) {
    performanceData.requestStats[path] = {
      count: 0,
      totalTime: 0,
      statusCodes: {}
    };
  }
  
  const stats = performanceData.requestStats[path];
  stats.count++;
  stats.totalTime += responseTime;
  
  if (!stats.statusCodes[statusCode]) {
    stats.statusCodes[statusCode] = 0;
  }
  stats.statusCodes[statusCode]++;
}

// 创建HTML页面
function createMonitorPage() {
  const uptime = Math.floor((Date.now() - performanceData.startTime) / 1000);
  const avgResponseTime = performanceData.requests > 0 
    ? (performanceData.totalResponseTime / performanceData.requests).toFixed(2) 
    : 0;
  const errorRate = performanceData.requests > 0 
    ? ((performanceData.errors / performanceData.requests) * 100).toFixed(2) 
    : 0;
  
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>性能监控面板</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: '#165DFF',
                success: '#00B42A',
                warning: '#FF7D00',
                danger: '#F53F3F',
                info: '#86909C',
                dark: '#1D2129',
                light: '#F2F3F5'
              },
              fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
              },
            },
          }
        }
      </script>
      <style type="text/tailwindcss">
        @layer utilities {
          .content-auto {
            content-visibility: auto;
          }
          .card-shadow {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .stat-card {
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          }
        }
      </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
      <header class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-primary flex items-center">
            <i class="fa fa-tachometer mr-2"></i>
            后端性能监控面板
          </h1>
          <div class="text-gray-500 text-sm">
            <i class="fa fa-clock-o mr-1"></i>
            运行时间: ${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <!-- 核心指标卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg p-6 card-shadow stat-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-600 font-medium">总请求数</h3>
              <span class="text-primary bg-blue-50 p-2 rounded-full">
                <i class="fa fa-exchange"></i>
              </span>
            </div>
            <p class="text-4xl font-bold text-dark">${performanceData.requests}</p>
            <p class="text-success flex items-center mt-2 text-sm">
              <i class="fa fa-arrow-up mr-1"></i>
              <span>实时计数</span>
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 card-shadow stat-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-600 font-medium">错误率</h3>
              <span class="text-warning bg-yellow-50 p-2 rounded-full">
                <i class="fa fa-exclamation-triangle"></i>
              </span>
            </div>
            <p class="text-4xl font-bold text-dark">${errorRate}%</p>
            <p class="text-info flex items-center mt-2 text-sm">
              <i class="fa fa-info-circle mr-1"></i>
              <span>基于总请求</span>
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 card-shadow stat-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-600 font-medium">平均响应时间</h3>
              <span class="text-success bg-green-50 p-2 rounded-full">
                <i class="fa fa-bolt"></i>
              </span>
            </div>
            <p class="text-4xl font-bold text-dark">${avgResponseTime}ms</p>
            <p class="text-info flex items-center mt-2 text-sm">
              <i class="fa fa-info-circle mr-1"></i>
              <span>所有请求的平均值</span>
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 card-shadow stat-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-600 font-medium">内存使用</h3>
              <span class="text-info bg-gray-50 p-2 rounded-full">
                <i class="fa fa-microchip"></i>
              </span>
            </div>
            <p class="text-4xl font-bold text-dark">
              ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
            </p>
            <p class="text-info flex items-center mt-2 text-sm">
              <i class="fa fa-info-circle mr-1"></i>
              <span>当前堆使用量</span>
            </p>
          </div>
        </div>
        
        <!-- 图表部分 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-lg p-6 card-shadow">
            <h3 class="text-lg font-medium text-dark mb-4">内存使用趋势</h3>
            <div class="w-full h-64">
              <canvas id="memoryChart"></canvas>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 card-shadow">
            <h3 class="text-lg font-medium text-dark mb-4">请求路径统计</h3>
            <div class="w-full h-64">
              <canvas id="requestChart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- 请求详情表格 -->
        <div class="bg-white rounded-lg p-6 card-shadow mb-8">
          <h3 class="text-lg font-medium text-dark mb-4">请求详细统计</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">路径</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">请求数</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均响应时间</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态码分布</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${Object.entries(performanceData.requestStats).map(([path, stats]) => {
                  const avgTime = (stats.totalTime / stats.count).toFixed(2);
                  const statusCodesHtml = Object.entries(stats.statusCodes)
                    .map(([code, count]) => {
                      let color = 'text-gray-600';
                      if (code >= 200 && code < 300) color = 'text-success';
                      else if (code >= 400 && code < 500) color = 'text-warning';
                      else if (code >= 500) color = 'text-danger';
                      return `<span class="${color} font-medium">${code}: ${count}</span>`;
                    })
                    .join(', ');
                  
                  return `
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">${path}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${stats.count}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${avgTime}ms</td>
                      <td class="px-6 py-4 text-sm text-gray-600">${statusCodesHtml}</td>
                    </tr>
                  `;
                }).join('') || `
                  <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">暂无请求数据</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer class="bg-white py-6 border-t border-gray-200">
        <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>系统性能监控 © ${new Date().getFullYear()} 海南文旅平台</p>
        </div>
      </footer>
      
      <script>
        // 等待页面加载完成和Chart.js加载
        document.addEventListener('DOMContentLoaded', function() {
          // 确保Chart对象已加载
          if (typeof Chart === 'undefined') {
            console.error('Chart.js 未加载');
            return;
          }

          // 绘制内存使用图表
          const memoryCtx = document.getElementById('memoryChart').getContext('2d');
          const memoryData = ${JSON.stringify(performanceData.memoryUsageHistory)};
          
          try {
            new Chart(memoryCtx, {
              type: 'line',
              data: {
                labels: memoryData.map(d => new Date(d.timestamp).toLocaleTimeString()),
                datasets: [
                  {
                    label: '堆内存使用 (MB)',
                    data: memoryData.map(d => Math.round(d.heapUsed / 1024 / 1024)),
                    borderColor: '#165DFF',
                    backgroundColor: 'rgba(22, 93, 255, 0.1)',
                    tension: 0.3,
                    fill: true
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value + ' MB';
                      }
                    }
                  }
                }
              }
            });
          } catch (error) {
            console.error('创建内存图表失败:', error);
          }
          
          // 绘制请求统计图表
          const requestCtx = document.getElementById('requestChart').getContext('2d');
          const requestStats = ${JSON.stringify(performanceData.requestStats)};
          
          try {
            new Chart(requestCtx, {
              type: 'bar',
              data: {
                labels: Object.keys(requestStats),
                datasets: [
                  {
                    label: '请求数量',
                    data: Object.values(requestStats).map(s => s.count),
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }
            });
          } catch (error) {
            console.error('创建请求图表失败:', error);
          }
          
          // 每5秒自动刷新页面
          setInterval(() => {
            window.location.reload();
          }, 5000);
        });
      </script>
    </body>
    </html>
  `;
}

// 创建服务器
const server = http.createServer((req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const startTime = Date.now();
  const { pathname } = parse(req.url, true);
  
  // 记录请求
  performanceData.requests++;
  
  // 返回监控页面
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(createMonitorPage());
  }
  // 返回性能数据API
  else if (pathname === '/api/performance' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: performanceData
    }));
  }
  // 404 未找到
  else {
    performanceData.errors++;
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: '资源未找到'
    }));
  }
  
  // 计算响应时间并记录
  const responseTime = Date.now() - startTime;
  performanceData.totalResponseTime += responseTime;
  
  // 记录路径统计
  const statusCode = res.statusCode;
  recordRequestStats(pathname, statusCode, responseTime);
  
  // 控制台日志
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} ${statusCode} ${responseTime}ms`);
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`性能监控服务器运行在 http://localhost:${PORT}`);
  console.log('监控页面: http://localhost:5002/');
  console.log('性能数据API: http://localhost:5002/api/performance');
});