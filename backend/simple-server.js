const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// 中间件
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 模拟用户数据库
const users = [];

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, phone, nickname } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码是必填项'
      });
    }

    // 检查用户是否已存在
    const existingUser = users.find(user => 
      user.username === username || user.email === email
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
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

    // 生成JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      'your-super-secret-jwt-key-here',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      'your-super-secret-refresh-key-here',
      { expiresIn: '30d' }
    );

    res.status(201).json({
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
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码是必填项'
      });
    }

    // 查找用户
    const user = users.find(u => 
      u.username === identifier || u.email === identifier
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'your-super-secret-jwt-key-here',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      'your-super-secret-refresh-key-here',
      { expiresIn: '30d' }
    );

    res.json({
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
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('健康检查: http://localhost:5000/health');
}); 