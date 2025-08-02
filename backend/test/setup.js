// 测试环境设置
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/hainan_tourism_test';
process.env.POSTGRES_URI = 'postgresql://localhost:5432/hainan_tourism_test';
process.env.REDIS_URI = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-secret-key';

// 全局测试设置
global.console = {
  ...console,
  // 在测试中静默某些日志
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 