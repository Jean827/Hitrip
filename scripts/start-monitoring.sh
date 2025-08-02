#!/bin/bash

# 监控系统启动脚本
# 用于启动Prometheus、AlertManager、Grafana等服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行，请启动Docker服务"
        exit 1
    fi
}

# 检查端口是否被占用
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "端口 $port 已被占用，$service 可能已经在运行"
        return 1
    fi
    return 0
}

# 创建监控网络
create_network() {
    if ! docker network ls | grep -q "monitoring"; then
        log_info "创建监控网络..."
        docker network create monitoring
    else
        log_info "监控网络已存在"
    fi
}

# 启动Prometheus
start_prometheus() {
    log_info "启动Prometheus..."
    
    if check_port 9090 "Prometheus"; then
        docker run -d \
            --name prometheus \
            --network monitoring \
            -p 9090:9090 \
            -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
            -v $(pwd)/alert_rules.yml:/etc/prometheus/alert_rules.yml \
            prom/prometheus:latest \
            --config.file=/etc/prometheus/prometheus.yml \
            --storage.tsdb.path=/prometheus \
            --web.console.libraries=/etc/prometheus/console_libraries \
            --web.console.templates=/etc/prometheus/consoles \
            --storage.tsdb.retention.time=200h \
            --web.enable-lifecycle
    fi
}

# 启动AlertManager
start_alertmanager() {
    log_info "启动AlertManager..."
    
    if check_port 9093 "AlertManager"; then
        docker run -d \
            --name alertmanager \
            --network monitoring \
            -p 9093:9093 \
            -v $(pwd)/alertmanager.yml:/etc/alertmanager/alertmanager.yml \
            prom/alertmanager:latest \
            --config.file=/etc/alertmanager/alertmanager.yml \
            --storage.path=/alertmanager
    fi
}

# 启动Grafana
start_grafana() {
    log_info "启动Grafana..."
    
    if check_port 3000 "Grafana"; then
        docker run -d \
            --name grafana \
            --network monitoring \
            -p 3000:3000 \
            -e GF_SECURITY_ADMIN_PASSWORD=admin123 \
            -e GF_USERS_ALLOW_SIGN_UP=false \
            grafana/grafana:latest
    fi
}

# 启动Node Exporter
start_node_exporter() {
    log_info "启动Node Exporter..."
    
    if check_port 9100 "Node Exporter"; then
        docker run -d \
            --name node-exporter \
            --network monitoring \
            -p 9100:9100 \
            --pid="host" \
            -v "/:/host:ro,rslave" \
            quay.io/prometheus/node-exporter:latest \
            --path.rootfs=/host
    fi
}

# 启动PostgreSQL Exporter
start_postgres_exporter() {
    log_info "启动PostgreSQL Exporter..."
    
    if check_port 9187 "PostgreSQL Exporter"; then
        docker run -d \
            --name postgres-exporter \
            --network monitoring \
            -p 9187:9187 \
            -e DATA_SOURCE_NAME="postgresql://postgres:password@host.docker.internal:5432/postgres?sslmode=disable" \
            prometheuscommunity/postgres-exporter:latest
    fi
}

# 启动Redis Exporter
start_redis_exporter() {
    log_info "启动Redis Exporter..."
    
    if check_port 9121 "Redis Exporter"; then
        docker run -d \
            --name redis-exporter \
            --network monitoring \
            -p 9121:9121 \
            -e REDIS_ADDR="redis://host.docker.internal:6379" \
            oliver006/redis_exporter:latest
    fi
}

# 启动Nginx Exporter
start_nginx_exporter() {
    log_info "启动Nginx Exporter..."
    
    if check_port 9113 "Nginx Exporter"; then
        docker run -d \
            --name nginx-exporter \
            --network monitoring \
            -p 9113:9113 \
            nginx/nginx-prometheus-exporter:latest \
            -nginx.scrape-uri=http://host.docker.internal/nginx_status
    fi
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    local services=("prometheus" "alertmanager" "grafana" "node-exporter" "postgres-exporter" "redis-exporter" "nginx-exporter")
    
    for service in "${services[@]}"; do
        if docker ps | grep -q "$service"; then
            log_info "$service 运行正常"
        else
            log_error "$service 未运行"
        fi
    done
}

# 显示访问信息
show_access_info() {
    echo ""
    log_info "监控系统启动完成！"
    echo ""
    echo "访问地址："
    echo "  Prometheus: http://localhost:9090"
    echo "  AlertManager: http://localhost:9093"
    echo "  Grafana: http://localhost:3000 (admin/admin123)"
    echo "  Node Exporter: http://localhost:9100"
    echo "  PostgreSQL Exporter: http://localhost:9187"
    echo "  Redis Exporter: http://localhost:9121"
    echo "  Nginx Exporter: http://localhost:9113"
    echo ""
    echo "Grafana配置："
    echo "  1. 登录Grafana (admin/admin123)"
    echo "  2. 添加Prometheus数据源: http://prometheus:9090"
    echo "  3. 导入仪表板: 使用grafana-dashboard.json"
    echo ""
}

# 停止所有监控服务
stop_monitoring() {
    log_info "停止监控服务..."
    
    local services=("prometheus" "alertmanager" "grafana" "node-exporter" "postgres-exporter" "redis-exporter" "nginx-exporter")
    
    for service in "${services[@]}"; do
        if docker ps | grep -q "$service"; then
            log_info "停止 $service..."
            docker stop $service
            docker rm $service
        fi
    done
}

# 清理监控数据
cleanup_monitoring() {
    log_info "清理监控数据..."
    
    # 停止并删除容器
    stop_monitoring
    
    # 删除监控网络
    if docker network ls | grep -q "monitoring"; then
        docker network rm monitoring
    fi
    
    # 删除监控数据卷
    docker volume prune -f
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            log_info "启动监控系统..."
            check_docker
            create_network
            start_prometheus
            start_alertmanager
            start_grafana
            start_node_exporter
            start_postgres_exporter
            start_redis_exporter
            start_nginx_exporter
            check_services
            show_access_info
            ;;
        "stop")
            stop_monitoring
            ;;
        "restart")
            stop_monitoring
            sleep 2
            main start
            ;;
        "cleanup")
            cleanup_monitoring
            ;;
        "status")
            check_services
            ;;
        *)
            echo "用法: $0 {start|stop|restart|cleanup|status}"
            echo "  start   - 启动监控系统"
            echo "  stop    - 停止监控系统"
            echo "  restart - 重启监控系统"
            echo "  cleanup - 清理监控系统"
            echo "  status  - 检查服务状态"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 