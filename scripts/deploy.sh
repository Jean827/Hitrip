#!/bin/bash

# 海南文旅系统部署脚本
# 作者: 项目团队
# 版本: 1.0.0
# 日期: 2025年1月23日

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 环境变量
APP_NAME="hainan-tourism"
DEPLOY_PATH="/var/www/hainan-tourism"
BACKUP_PATH="/var/backups/hainan-tourism"
LOG_PATH="/var/log/hainan-tourism"
GIT_REPO="https://github.com/your-org/hainan-tourism.git"
BRANCH="main"

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请勿使用root用户运行此脚本"
        exit 1
    fi
}

# 检查系统要求
check_system_requirements() {
    log_info "检查系统要求..."
    
    # 检查操作系统
    if [[ ! -f /etc/os-release ]]; then
        log_error "无法检测操作系统"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装"
        exit 1
    fi
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "Git未安装"
        exit 1
    fi
    
    log_success "系统要求检查通过"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    sudo mkdir -p $DEPLOY_PATH
    sudo mkdir -p $BACKUP_PATH
    sudo mkdir -p $LOG_PATH
    sudo mkdir -p /var/www/uploads
    
    # 设置权限
    sudo chown -R $USER:$USER $DEPLOY_PATH
    sudo chown -R $USER:$USER $BACKUP_PATH
    sudo chown -R $USER:$USER $LOG_PATH
    sudo chown -R www-data:www-data /var/www/uploads
    
    log_success "目录创建完成"
}

# 备份当前版本
backup_current_version() {
    if [ -d "$DEPLOY_PATH/current" ]; then
        log_info "备份当前版本..."
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        sudo cp -r $DEPLOY_PATH/current $BACKUP_PATH/$BACKUP_NAME
        log_success "备份完成: $BACKUP_NAME"
    else
        log_warning "没有找到当前版本，跳过备份"
    fi
}

# 拉取最新代码
pull_latest_code() {
    log_info "拉取最新代码..."
    
    if [ ! -d "$DEPLOY_PATH/repo" ]; then
        log_info "克隆代码仓库..."
        git clone $GIT_REPO $DEPLOY_PATH/repo
    fi
    
    cd $DEPLOY_PATH/repo
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
    
    # 获取最新提交信息
    COMMIT_HASH=$(git rev-parse --short HEAD)
    COMMIT_MESSAGE=$(git log -1 --pretty=%B)
    
    log_success "代码更新完成 - 提交: $COMMIT_HASH"
    log_info "提交信息: $COMMIT_MESSAGE"
}

# 安装后端依赖
install_backend_dependencies() {
    log_info "安装后端依赖..."
    
    cd $DEPLOY_PATH/repo/backend
    
    # 清理node_modules
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # 安装依赖
    npm ci --production
    
    log_success "后端依赖安装完成"
}

# 安装前端依赖
install_frontend_dependencies() {
    log_info "安装前端依赖..."
    
    cd $DEPLOY_PATH/repo/frontend
    
    # 清理node_modules
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    # 安装依赖
    npm ci
    
    log_success "前端依赖安装完成"
}

# 构建前端应用
build_frontend() {
    log_info "构建前端应用..."
    
    cd $DEPLOY_PATH/repo/frontend
    
    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        log_error "缺少生产环境配置文件 .env.production"
        exit 1
    fi
    
    # 构建应用
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "前端构建完成"
    else
        log_error "前端构建失败"
        exit 1
    fi
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    cd $DEPLOY_PATH/repo
    
    # 复制环境变量文件
    if [ -f "backend/.env.production" ]; then
        cp backend/.env.production backend/.env
        log_success "后端环境变量配置完成"
    else
        log_warning "缺少后端生产环境配置文件"
    fi
    
    if [ -f "frontend/.env.production" ]; then
        cp frontend/.env.production frontend/.env
        log_success "前端环境变量配置完成"
    else
        log_warning "缺少前端生产环境配置文件"
    fi
}

# 执行数据库迁移
run_database_migration() {
    log_info "执行数据库迁移..."
    
    cd $DEPLOY_PATH/repo/backend
    
    # 检查数据库连接
    if npm run db:test; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        exit 1
    fi
    
    # 执行迁移
    if npm run migrate:prod; then
        log_success "数据库迁移完成"
    else
        log_error "数据库迁移失败"
        exit 1
    fi
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    cd $DEPLOY_PATH/repo
    
    # 检查PM2是否安装
    if ! command -v pm2 &> /dev/null; then
        log_info "安装PM2..."
        sudo npm install -g pm2
    fi
    
    # 重启或启动服务
    if pm2 list | grep -q "hainan-tourism-api"; then
        log_info "重启现有服务..."
        pm2 restart hainan-tourism-api
    else
        log_info "启动新服务..."
        pm2 start backend/ecosystem.config.js
    fi
    
    # 保存PM2配置
    pm2 save
    
    # 设置PM2开机自启
    pm2 startup
    
    log_success "服务重启完成"
}

# 清理缓存
clear_cache() {
    log_info "清理缓存..."
    
    # 清理Nginx缓存
    if command -v nginx &> /dev/null; then
        sudo nginx -s reload
        log_success "Nginx缓存清理完成"
    fi
    
    # 清理Redis缓存（可选）
    if command -v redis-cli &> /dev/null; then
        redis-cli FLUSHALL
        log_success "Redis缓存清理完成"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查服务状态
    if pm2 list | grep -q "hainan-tourism-api.*online"; then
        log_success "API服务运行正常"
    else
        log_error "API服务运行异常"
        exit 1
    fi
    
    # 检查端口监听
    if netstat -tlnp | grep -q ":5000"; then
        log_success "端口5000监听正常"
    else
        log_error "端口5000监听异常"
        exit 1
    fi
    
    log_success "健康检查通过"
}

# 部署完成
deployment_complete() {
    log_success "=========================================="
    log_success "🎉 海南文旅系统部署完成！"
    log_success "=========================================="
    log_info "部署路径: $DEPLOY_PATH"
    log_info "备份路径: $BACKUP_PATH"
    log_info "日志路径: $LOG_PATH"
    log_info "服务状态: $(pm2 list | grep hainan-tourism-api)"
    log_success "=========================================="
}

# 错误处理
handle_error() {
    log_error "部署过程中发生错误"
    log_error "错误代码: $?"
    log_error "请检查日志文件: $LOG_PATH/deploy.log"
    exit 1
}

# 主函数
main() {
    # 设置错误处理
    trap handle_error ERR
    
    # 记录开始时间
    START_TIME=$(date +%s)
    
    log_info "🚀 开始部署海南文旅系统..."
    log_info "部署时间: $(date)"
    log_info "部署路径: $DEPLOY_PATH"
    
    # 执行部署步骤
    check_root
    check_system_requirements
    create_directories
    backup_current_version
    pull_latest_code
    install_backend_dependencies
    install_frontend_dependencies
    build_frontend
    setup_environment
    run_database_migration
    restart_services
    clear_cache
    health_check
    
    # 计算部署时间
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    deployment_complete
    
    log_info "部署耗时: ${DURATION}秒"
    log_success "部署脚本执行完成！"
}

# 显示帮助信息
show_help() {
    echo "海南文旅系统部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -v, --version  显示版本信息"
    echo ""
    echo "示例:"
    echo "  $0             执行完整部署"
    echo "  $0 --help      显示帮助信息"
}

# 显示版本信息
show_version() {
    echo "海南文旅系统部署脚本 v1.0.0"
    echo "作者: 项目团队"
    echo "日期: 2025年1月23日"
}

# 解析命令行参数
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--version)
        show_version
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "未知参数: $1"
        show_help
        exit 1
        ;;
esac 