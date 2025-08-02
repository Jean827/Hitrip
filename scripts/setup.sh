#!/bin/bash

# 海南文旅公司应用系统设置脚本

set -e

echo "🚀 开始设置海南文旅公司应用系统..."

# 检查必要的工具
check_requirements() {
    echo "📋 检查系统要求..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js >= 18.0.0"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm >= 9.0.0"
        exit 1
    fi
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker >= 20.0.0"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose >= 2.0.0"
        exit 1
    fi
    
    echo "✅ 系统要求检查通过"
}

# 安装依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    
    # 安装根目录依赖
    echo "安装根目录依赖..."
    npm install
    
    # 安装前端依赖
    echo "安装前端依赖..."
    cd frontend && npm install && cd ..
    
    # 安装后端依赖
    echo "安装后端依赖..."
    cd backend && npm install && cd ..
    
    echo "✅ 依赖安装完成"
}

# 创建环境配置文件
create_env_files() {
    echo "⚙️ 创建环境配置文件..."
    
    # 创建根目录 .env 文件
    if [ ! -f .env ]; then
        cat > .env << EOF
# 海南文旅公司应用系统环境配置

# 数据库配置
DATABASE_URL=postgresql://hainan_user:hainan_password@localhost:5432/hainan_tourism
MONGODB_URL=mongodb://hainan_admin:hainan_password@localhost:27017/hainan_tourism
MYSQL_URL=mysql://hainan_user:hainan_password@localhost:3306/hainan_business

# Redis配置
REDIS_URL=redis://localhost:6379

# RabbitMQ配置
RABBITMQ_URL=amqp://hainan_user:hainan_password@localhost:5672

# JWT配置
JWT_SECRET=hainan_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 第三方服务配置 (需要替换为实际值)
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key

# 文件存储配置 (需要替换为实际值)
OSS_ACCESS_KEY_ID=your_oss_access_key_id
OSS_ACCESS_KEY_SECRET=your_oss_access_key_secret
OSS_BUCKET=your_oss_bucket
OSS_REGION=your_oss_region

# 高德地图配置 (需要替换为实际值)
AMAP_KEY=your_amap_key
AMAP_SECRET=your_amap_secret
EOF
        echo "✅ 创建根目录 .env 文件"
    fi
    
    # 创建前端 .env 文件
    if [ ! -f frontend/.env ]; then
        cat > frontend/.env << EOF
# 前端环境配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=海南文旅平台
VITE_APP_DESCRIPTION=探索海南美景，体验独特文化
EOF
        echo "✅ 创建前端 .env 文件"
    fi
    
    # 创建后端 .env 文件
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
# 后端环境配置
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL=postgresql://hainan_user:hainan_password@localhost:5432/hainan_tourism
MONGODB_URL=mongodb://hainan_admin:hainan_password@localhost:27017/hainan_tourism
MYSQL_URL=mysql://hainan_user:hainan_password@localhost:3306/hainan_business

# Redis配置
REDIS_URL=redis://localhost:6379

# RabbitMQ配置
RABBITMQ_URL=amqp://hainan_user:hainan_password@localhost:5672

# JWT配置
JWT_SECRET=hainan_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
EOF
        echo "✅ 创建后端 .env 文件"
    fi
}

# 启动数据库服务
start_database() {
    echo "🗄️ 启动数据库服务..."
    
    # 启动数据库容器
    docker-compose up -d postgres mongodb mysql redis rabbitmq
    
    echo "⏳ 等待数据库服务启动..."
    sleep 10
    
    echo "✅ 数据库服务启动完成"
}

# 初始化数据库
init_database() {
    echo "🗃️ 初始化数据库..."
    
    # 等待数据库完全启动
    sleep 5
    
    # 运行数据库迁移
    echo "运行数据库迁移..."
    cd backend && npm run db:migrate && cd ..
    
    # 运行数据库种子数据
    echo "运行数据库种子数据..."
    cd backend && npm run db:seed && cd ..
    
    echo "✅ 数据库初始化完成"
}

# 构建项目
build_project() {
    echo "🔨 构建项目..."
    
    # 构建前端
    echo "构建前端..."
    cd frontend && npm run build && cd ..
    
    # 构建后端
    echo "构建后端..."
    cd backend && npm run build && cd ..
    
    echo "✅ 项目构建完成"
}

# 显示启动信息
show_startup_info() {
    echo ""
    echo "🎉 海南文旅公司应用系统设置完成！"
    echo ""
    echo "📋 访问地址："
    echo "  前端应用: http://localhost:5173"
    echo "  后端API: http://localhost:3000"
    echo "  API文档: http://localhost:3000/api-docs"
    echo "  管理后台: http://localhost:5174"
    echo "  监控面板: http://localhost:3001"
    echo ""
    echo "📋 数据库连接信息："
    echo "  PostgreSQL: localhost:5432 (hainan_user/hainan_password)"
    echo "  MongoDB: localhost:27017 (hainan_admin/hainan_password)"
    echo "  MySQL: localhost:3306 (hainan_user/hainan_password)"
    echo "  Redis: localhost:6379"
    echo "  RabbitMQ: localhost:5672 (hainan_user/hainan_password)"
    echo ""
    echo "🚀 启动开发服务器："
    echo "  npm run dev"
    echo ""
    echo "📚 更多信息请查看 README.md"
    echo ""
}

# 主函数
main() {
    check_requirements
    install_dependencies
    create_env_files
    start_database
    init_database
    build_project
    show_startup_info
}

# 运行主函数
main "$@" 