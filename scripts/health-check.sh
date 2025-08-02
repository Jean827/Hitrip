#!/bin/bash

# 海南文旅系统健康检查脚本
# 作者: 项目团队
# 版本: 1.0.0
# 日期: 2025年1月23日

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 配置
APP_URL="https://hainan-tourism.com"
API_URL="https://api.hainan-tourism.com"
LOCAL_API_URL="http://localhost:5000"

# 检查函数
check_service() {
    local service_name=$1
    local url=$2
    local endpoint=$3
    
    log_info "检查 $service_name..."
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url$endpoint" --connect-timeout 10)
    
    if [ $status_code -eq 200 ]; then
        log_success "$service_name 正常 (状态码: $status_code)"
        return 0
    else
        log_error "$service_name 异常 (状态码: $status_code)"
        return 1
    fi
}

# 检查PM2服务
check_pm2_service() {
    log_info "检查PM2服务状态..."
    
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "hainan-tourism-api.*online"; then
            log_success "PM2服务运行正常"
            return 0
        else
            log_error "PM2服务运行异常"
            return 1
        fi
    else
        log_error "PM2未安装"
        return 1
    fi
}

# 检查端口监听
check_port_listening() {
    local port=$1
    local service_name=$2
    
    log_info "检查 $service_name 端口监听..."
    
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        log_success "$service_name 端口 $port 监听正常"
        return 0
    else
        log_error "$service_name 端口 $port 监听异常"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."
    
    if command -v psql &> /dev/null; then
        if psql -h localhost -U hainan_user -d hainan_tourism_prod -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "数据库连接正常"
            return 0
        else
            log_error "数据库连接异常"
            return 1
        fi
    else
        log_warning "PostgreSQL客户端未安装，跳过数据库连接检查"
        return 0
    fi
}

# 检查Redis连接
check_redis() {
    log_info "检查Redis连接..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping >/dev/null 2>&1; then
            log_success "Redis连接正常"
            return 0
        else
            log_error "Redis连接异常"
            return 1
        fi
    else
        log_warning "Redis客户端未安装，跳过Redis连接检查"
        return 0
    fi
}

# 检查磁盘空间
check_disk_space() {
    log_info "检查磁盘空间..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage -lt 80 ]; then
        log_success "磁盘空间充足 (使用率: ${usage}%)"
        return 0
    else
        log_warning "磁盘空间不足 (使用率: ${usage}%)"
        return 1
    fi
}

# 检查内存使用
check_memory_usage() {
    log_info "检查内存使用..."
    
    local total=$(free -m | awk 'NR==2{print $2}')
    local used=$(free -m | awk 'NR==2{print $3}')
    local usage=$((used * 100 / total))
    
    if [ $usage -lt 80 ]; then
        log_success "内存使用正常 (使用率: ${usage}%)"
        return 0
    else
        log_warning "内存使用较高 (使用率: ${usage}%)"
        return 1
    fi
}

# 检查CPU使用
check_cpu_usage() {
    log_info "检查CPU使用..."
    
    local usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    if [ $usage -lt 80 ]; then
        log_success "CPU使用正常 (使用率: ${usage}%)"
        return 0
    else
        log_warning "CPU使用较高 (使用率: ${usage}%)"
        return 1
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    log_info "检查SSL证书..."
    
    local cert_expiry=$(echo | openssl s_client -servername hainan-tourism.com -connect hainan-tourism.com:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ ! -z "$cert_expiry" ]; then
        local expiry_date=$(date -d "$cert_expiry" +%s)
        local current_date=$(date +%s)
        local days_remaining=$(( (expiry_date - current_date) / 86400 ))
        
        if [ $days_remaining -gt 30 ]; then
            log_success "SSL证书有效 (剩余天数: $days_remaining)"
            return 0
        else
            log_warning "SSL证书即将过期 (剩余天数: $days_remaining)"
            return 1
        fi
    else
        log_error "无法检查SSL证书"
        return 1
    fi
}

# 检查日志文件
check_log_files() {
    log_info "检查日志文件..."
    
    local log_dir="/var/log/hainan-tourism"
    local error_count=0
    
    if [ -d "$log_dir" ]; then
        # 检查最近的错误日志
        if [ -f "$log_dir/err.log" ]; then
            local recent_errors=$(tail -n 100 "$log_dir/err.log" | grep -c "ERROR\|FATAL" || echo "0")
            if [ $recent_errors -eq 0 ]; then
                log_success "错误日志正常"
            else
                log_warning "发现 $recent_errors 个错误"
                error_count=$((error_count + 1))
            fi
        fi
        
        # 检查日志文件大小
        for log_file in "$log_dir"/*.log; do
            if [ -f "$log_file" ]; then
                local size=$(stat -c%s "$log_file")
                local size_mb=$((size / 1024 / 1024))
                
                if [ $size_mb -lt 100 ]; then
                    log_success "$(basename $log_file) 大小正常 (${size_mb}MB)"
                else
                    log_warning "$(basename $log_file) 大小过大 (${size_mb}MB)"
                    error_count=$((error_count + 1))
                fi
            fi
        done
    else
        log_warning "日志目录不存在"
        error_count=$((error_count + 1))
    fi
    
    return $error_count
}

# 生成健康报告
generate_health_report() {
    local total_checks=$1
    local passed_checks=$2
    local failed_checks=$3
    
    echo ""
    log_info "=========================================="
    log_info "🏥 健康检查报告"
    log_info "=========================================="
    log_info "总检查项: $total_checks"
    log_info "通过: $passed_checks"
    log_info "失败: $failed_checks"
    
    local success_rate=$((passed_checks * 100 / total_checks))
    log_info "成功率: ${success_rate}%"
    
    if [ $failed_checks -eq 0 ]; then
        log_success "🎉 所有检查通过！系统运行正常"
    else
        log_warning "⚠️ 发现 $failed_checks 个问题，请及时处理"
    fi
    
    log_info "=========================================="
}

# 主函数
main() {
    local total_checks=0
    local passed_checks=0
    local failed_checks=0
    
    echo "🏥 开始海南文旅系统健康检查..."
    echo "检查时间: $(date)"
    echo ""
    
    # 执行各项检查
    check_pm2_service && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_port_listening 5000 "API服务" && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_service "前端应用" "$APP_URL" "" && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_service "API服务" "$LOCAL_API_URL" "/health" && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_service "数据库健康" "$LOCAL_API_URL" "/api/health/db" && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_service "Redis健康" "$LOCAL_API_URL" "/api/health/redis" && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_database && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_redis && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_disk_space && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_memory_usage && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_cpu_usage && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_ssl_certificate && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    check_log_files && ((passed_checks++)) || ((failed_checks++))
    ((total_checks++))
    
    # 生成报告
    generate_health_report $total_checks $passed_checks $failed_checks
    
    # 返回状态码
    if [ $failed_checks -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "海南文旅系统健康检查脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -v, --version  显示版本信息"
    echo ""
    echo "检查项目:"
    echo "  - PM2服务状态"
    echo "  - 端口监听状态"
    echo "  - 前端应用访问"
    echo "  - API服务健康"
    echo "  - 数据库连接"
    echo "  - Redis连接"
    echo "  - 系统资源使用"
    echo "  - SSL证书状态"
    echo "  - 日志文件状态"
}

# 显示版本信息
show_version() {
    echo "海南文旅系统健康检查脚本 v1.0.0"
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