#!/bin/bash

# 海南文旅项目启动脚本

echo "🚀 启动海南文旅项目..."

# 检查Node.js版本
NODE_VERSION=$(node -v)
echo "📦 Node.js版本: $NODE_VERSION"

# 检查是否安装了依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 检查环境变量文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告: backend/.env 文件不存在，请复制 .env.example 并配置环境变量"
    if [ -f "backend/.env.example" ]; then
        echo "📋 复制环境变量模板..."
        cp backend/.env.example backend/.env
        echo "✅ 已创建 .env 文件，请编辑配置"
    fi
fi

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端服务
echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ 项目启动完成！"
echo "🌐 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:5000"
echo "📚 API文档: http://localhost:5000/api-docs"

# 等待用户中断
echo ""
echo "按 Ctrl+C 停止服务"
wait 