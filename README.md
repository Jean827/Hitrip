# 海南文旅公司应用系统

一个基于现代Web技术栈构建的海南文化旅游公司应用系统，提供用户管理、权限控制、积分系统等完整功能。

## 🚀 技术栈

### 后端
- **Node.js** + **TypeScript** - 运行时和开发语言
- **Express.js** - Web框架
- **MongoDB** + **Mongoose** - 主数据库
- **PostgreSQL** + **pg** - 关系型数据库
- **Redis** + **ioredis** - 缓存和会话存储
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Multer** + **Sharp** - 文件上传和图片处理
- **Nodemailer** - 邮件发送
- **Swagger** - API文档

### 前端
- **React** + **TypeScript** - 前端框架
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **Tailwind CSS** - 样式框架
- **Redux Toolkit** - 状态管理
- **React Query** - 数据获取
- **React Router** - 路由管理
- **Axios** - HTTP客户端

## 📋 功能特性

### 用户系统
- ✅ 用户注册/登录
- ✅ 邮箱验证
- ✅ 密码重置
- ✅ 手机号绑定
- ✅ 个人资料管理
- ✅ 头像上传
- ✅ 积分系统
- ✅ 等级系统

### 权限管理
- ✅ 角色管理
- ✅ 权限管理
- ✅ 基于角色的访问控制(RBAC)
- ✅ 动态菜单权限

### 管理后台
- ✅ 用户管理
- ✅ 角色管理
- ✅ 权限管理
- ✅ 数据统计
- ✅ 批量操作

### 系统功能
- ✅ JWT认证
- ✅ 请求验证
- ✅ 错误处理
- ✅ 日志记录
- ✅ 文件上传
- ✅ 邮件发送
- ✅ SMS发送
- ✅ API文档

## 🛠️ 安装和运行

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- PostgreSQL >= 13.0
- Redis >= 6.0

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd Hitrip
```

2. **安装依赖**
```bash
# 安装前端依赖
cd frontend && npm install && cd ..

# 安装后端依赖
cd backend && npm install && cd ..
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑配置文件
vim backend/.env
```

4. **启动项目**
```bash
# 使用启动脚本
chmod +x scripts/start.sh
./scripts/start.sh

# 或手动启动
# 启动后端
cd backend && npm run dev

# 启动前端
cd frontend && npm run dev
```

### 环境变量配置

在 `backend/.env` 文件中配置以下变量：

```env
# 服务器配置
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/hainan_tourism
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hainan_tourism
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 短信配置
SMS_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=your-access-key
ALIYUN_ACCESS_KEY_SECRET=your-secret-key
ALIYUN_SMS_SIGN_NAME=your-sign-name
ALIYUN_SMS_TEMPLATE_CODE=your-template-code
```

## 📚 API文档

启动项目后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:5000/api-docs
- **API Base URL**: http://localhost:5000/api

## 🏗️ 项目结构

```
Hitrip/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   └── App.tsx         # 主应用
│   ├── package.json
│   └── vite.config.ts
├── docs/                   # 项目文档
├── scripts/                # 脚本文件
└── README.md
```

## 🔧 开发命令

### 后端
```bash
cd backend

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 测试
npm test

# 代码检查
npm run lint
```

### 前端
```bash
cd frontend

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 📝 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 配置
- 使用语义化的提交信息

### 分支管理
- `main` - 主分支，用于生产环境
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 热修复分支

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your-email@example.com]
- 项目地址: [https://github.com/your-username/Hitrip]

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！ 