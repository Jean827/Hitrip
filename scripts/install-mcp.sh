#!/bin/bash

# 海南文旅项目 - MCP服务器自动安装脚本

set -e

# 配置颜色输出
green="\033[0;32m"
red="\033[0;31m"
yellow="\033[0;33m"
blue="\033[0;34m"
reset="\033[0m"

# 检查必要的工具
check_requirements() {
    echo -e "${blue}📋 检查MCP服务器安装要求...${reset}"
    
    # 检查 curl
    if ! command -v curl &> /dev/null; then
        echo -e "${red}❌ curl 未安装，请先安装 curl${reset}"
        exit 1
    fi
    
    # 检查 jq
    if ! command -v jq &> /dev/null; then
        echo -e "${red}❌ jq 未安装，请先安装 jq${reset}"
        exit 1
    fi
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        echo -e "${red}❌ git 未安装，请先安装 git${reset}"
        exit 1
    fi
    
    echo -e "${green}✅ MCP服务器安装要求检查通过${reset}"
}

# 安装 PostgreSQL MCP Server
install_postgresql_mcp() {
    echo -e "${blue}\n🚀 安装 PostgreSQL MCP Server（高优先级）${reset}"
    
    # 创建 PostgreSQL MCP Server 目录
    mkdir -p mcp/postgresql
    
    # 下载 PostgreSQL MCP Server
    echo -e "${yellow}📥 下载 PostgreSQL MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/postgresql-mcp/releases/latest/download/postgresql-mcp-linux-amd64.tar.gz -o mcp/postgresql.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 PostgreSQL MCP Server...${reset}"
    tar -xzf mcp/postgresql.tar.gz -C mcp/postgresql --strip-components=1
    rm mcp/postgresql.tar.gz
    
    # 授予执行权限
    chmod +x mcp/postgresql/postgresql-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 PostgreSQL MCP Server 配置文件...${reset}"
    cat > mcp/postgresql/config.json << EOF
{
  "host": "localhost",
  "port": 5432,
  "username": "hainan_user",
  "password": "hainan_password",
  "database": "hainan_tourism",
  "ssl": false,
  "pool": {
    "max": 10,
    "min": 0,
    "idleTimeoutMillis": 30000
  }
}
EOF
    
    # 创建启动脚本
    cat > mcp/postgresql/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/postgresql
./postgresql-mcp --config config.json
EOF
    chmod +x mcp/postgresql/start.sh
    
    echo -e "${green}✅ PostgreSQL MCP Server 安装完成${reset}"
    echo -e "${blue}   启动命令: ./mcp/postgresql/start.sh${reset}"
}

# 安装 Docker MCP Server
install_docker_mcp() {
    echo -e "${blue}\n🚀 安装 Docker MCP Server（高优先级）${reset}"
    
    # 创建 Docker MCP Server 目录
    mkdir -p mcp/docker
    
    # 下载 Docker MCP Server
    echo -e "${yellow}📥 下载 Docker MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/docker-mcp/releases/latest/download/docker-mcp-linux-amd64.tar.gz -o mcp/docker.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 Docker MCP Server...${reset}"
    tar -xzf mcp/docker.tar.gz -C mcp/docker --strip-components=1
    rm mcp/docker.tar.gz
    
    # 授予执行权限
    chmod +x mcp/docker/docker-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 Docker MCP Server 配置文件...${reset}"
    cat > mcp/docker/config.json << EOF
{
  "socketPath": "/var/run/docker.sock",
  "apiVersion": "v1.41",
  "timeout": 60
}
EOF
    
    # 创建启动脚本
    cat > mcp/docker/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/docker
./docker-mcp --config config.json
EOF
    chmod +x mcp/docker/start.sh
    
    echo -e "${green}✅ Docker MCP Server 安装完成${reset}"
    echo -e "${blue}   启动命令: ./mcp/docker/start.sh${reset}"
}

# 安装 File System MCP Server
install_filesystem_mcp() {
    echo -e "${blue}\n🚀 安装 File System MCP Server（中高优先级）${reset}"
    
    # 创建 File System MCP Server 目录
    mkdir -p mcp/filesystem
    
    # 下载 File System MCP Server
    echo -e "${yellow}📥 下载 File System MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/filesystem-mcp/releases/latest/download/filesystem-mcp-linux-amd64.tar.gz -o mcp/filesystem.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 File System MCP Server...${reset}"
    tar -xzf mcp/filesystem.tar.gz -C mcp/filesystem --strip-components=1
    rm mcp/filesystem.tar.gz
    
    # 授予执行权限
    chmod +x mcp/filesystem/filesystem-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 File System MCP Server 配置文件...${reset}"
    cat > mcp/filesystem/config.json << EOF
{
  "rootPath": "$(pwd)/docs",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  },
  "maxFileSize": 10485760
}
EOF
    
    # 创建启动脚本
    cat > mcp/filesystem/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/filesystem
./filesystem-mcp --config config.json
EOF
    chmod +x mcp/filesystem/start.sh
    
    echo -e "${green}✅ File System MCP Server 安装完成${reset}"
    echo -e "${blue}   启动命令: ./mcp/filesystem/start.sh${reset}"
}

# 安装 GitHub MCP Server
install_github_mcp() {
    echo -e "${blue}\n🚀 安装 GitHub MCP Server（中高优先级）${reset}"
    
    # 创建 GitHub MCP Server 目录
    mkdir -p mcp/github
    
    # 下载 GitHub MCP Server
    echo -e "${yellow}📥 下载 GitHub MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/github-mcp/releases/latest/download/github-mcp-linux-amd64.tar.gz -o mcp/github.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 GitHub MCP Server...${reset}"
    tar -xzf mcp/github.tar.gz -C mcp/github --strip-components=1
    rm mcp/github.tar.gz
    
    # 授予执行权限
    chmod +x mcp/github/github-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 GitHub MCP Server 配置文件...${reset}"
    cat > mcp/github/config.json << EOF
{
  "apiToken": "YOUR_GITHUB_TOKEN",
  "baseUrl": "https://api.github.com",
  "defaultOwner": "YOUR_GITHUB_ORG",
  "defaultRepo": "Hitrip",
  "webhookSecret": "YOUR_WEBHOOK_SECRET"
}
EOF
    
    # 创建启动脚本
    cat > mcp/github/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/github
./github-mcp --config config.json
EOF
    chmod +x mcp/github/start.sh
    
    echo -e "${green}✅ GitHub MCP Server 安装完成${reset}"
    echo -e "${yellow}   注意：请修改配置文件中的 GitHub Token 和组织信息${reset}"
    echo -e "${blue}   启动命令: ./mcp/github/start.sh${reset}"
}

# 安装 YesDev MCP Server
install_yesdev_mcp() {
    echo -e "${blue}\n🚀 安装 YesDev MCP Server（中优先级）${reset}"
    
    # 创建 YesDev MCP Server 目录
    mkdir -p mcp/yesdev
    
    # 下载 YesDev MCP Server
    echo -e "${yellow}📥 下载 YesDev MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/yesdev-mcp/releases/latest/download/yesdev-mcp-linux-amd64.tar.gz -o mcp/yesdev.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 YesDev MCP Server...${reset}"
    tar -xzf mcp/yesdev.tar.gz -C mcp/yesdev --strip-components=1
    rm mcp/yesdev.tar.gz
    
    # 授予执行权限
    chmod +x mcp/yesdev/yesdev-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 YesDev MCP Server 配置文件...${reset}"
    cat > mcp/yesdev/config.json << EOF
{
  "baseUrl": "https://api.yesdev.cn",
  "apiKey": "YOUR_YESDEV_API_KEY",
  "projectId": "YOUR_YESDEV_PROJECT_ID",
  "autoSyncHours": 24
}
EOF
    
    # 创建启动脚本
    cat > mcp/yesdev/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/yesdev
./yesdev-mcp --config config.json
EOF
    chmod +x mcp/yesdev/start.sh
    
    echo -e "${green}✅ YesDev MCP Server 安装完成${reset}"
    echo -e "${yellow}   注意：请修改配置文件中的 API Key 和项目 ID${reset}"
    echo -e "${blue}   启动命令: ./mcp/yesdev/start.sh${reset}"
}

# 安装 Browser MCP for Automation
install_browser_mcp() {
    echo -e "${blue}\n🚀 安装 Browser MCP for Automation（中优先级）${reset}"
    
    # 创建 Browser MCP 目录
    mkdir -p mcp/browser
    
    # 下载 Browser MCP
    echo -e "${yellow}📥 下载 Browser MCP for Automation...${reset}"
    curl -sSL https://github.com/mcp-toolkit/browser-mcp/releases/latest/download/browser-mcp-linux-amd64.tar.gz -o mcp/browser.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 Browser MCP for Automation...${reset}"
    tar -xzf mcp/browser.tar.gz -C mcp/browser --strip-components=1
    rm mcp/browser.tar.gz
    
    # 授予执行权限
    chmod +x mcp/browser/browser-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 Browser MCP 配置文件...${reset}"
    cat > mcp/browser/config.json << EOF
{
  "browser": "chrome",
  "headless": true,
  "timeout": 30000,
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  }
}
EOF
    
    # 创建启动脚本
    cat > mcp/browser/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/browser
./browser-mcp --config config.json
EOF
    chmod +x mcp/browser/start.sh
    
    echo -e "${green}✅ Browser MCP for Automation 安装完成${reset}"
    echo -e "${blue}   启动命令: ./mcp/browser/start.sh${reset}"
}

# 安装 Slack MCP Server
install_slack_mcp() {
    echo -e "${blue}\n🚀 安装 Slack MCP Server（低优先级）${reset}"
    
    # 创建 Slack MCP Server 目录
    mkdir -p mcp/slack
    
    # 下载 Slack MCP Server
    echo -e "${yellow}📥 下载 Slack MCP Server...${reset}"
    curl -sSL https://github.com/mcp-toolkit/slack-mcp/releases/latest/download/slack-mcp-linux-amd64.tar.gz -o mcp/slack.tar.gz
    
    # 解压文件
    echo -e "${yellow}📦 解压 Slack MCP Server...${reset}"
    tar -xzf mcp/slack.tar.gz -C mcp/slack --strip-components=1
    rm mcp/slack.tar.gz
    
    # 授予执行权限
    chmod +x mcp/slack/slack-mcp
    
    # 创建配置文件
    echo -e "${yellow}⚙️ 创建 Slack MCP Server 配置文件...${reset}"
    cat > mcp/slack/config.json << EOF
{
  "token": "YOUR_SLACK_BOT_TOKEN",
  "signingSecret": "YOUR_SLACK_SIGNING_SECRET",
  "appToken": "YOUR_SLACK_APP_TOKEN",
  "defaultChannel": "#general",
  "socketMode": true
}
EOF
    
    # 创建启动脚本
    cat > mcp/slack/start.sh << EOF
#!/bin/bash
cd $(pwd)/mcp/slack
./slack-mcp --config config.json
EOF
    chmod +x mcp/slack/start.sh
    
    echo -e "${green}✅ Slack MCP Server 安装完成${reset}"
    echo -e "${yellow}   注意：请修改配置文件中的 Slack Token 和密钥信息${reset}"
    echo -e "${blue}   启动命令: ./mcp/slack/start.sh${reset}"
}

# 创建 MCP 服务管理脚本
create_mcp_manager() {
    echo -e "${blue}\n📋 创建 MCP 服务管理脚本...${reset}"
    
    cat > mcp/manage-mcp.sh << EOF
#!/bin/bash

# MCP 服务管理脚本

set -e

green="\\033[0;32m"
red="\\033[0;31m"
yellow="\\033[0;33m"
blue="\\033[0;34m"
reset="\\033[0m"

# 启动所有 MCP 服务
start_all() {
    echo -e "${blue}🚀 启动所有 MCP 服务...${reset}"
    
    # 按优先级顺序启动
    echo -e "${yellow}📌 启动高优先级服务...${reset}"
    ./postgresql/start.sh &
    sleep 2
    ./docker/start.sh &
    sleep 2
    
    echo -e "${yellow}📌 启动中高优先级服务...${reset}"
    ./filesystem/start.sh &
    sleep 2
    ./github/start.sh &
    sleep 2
    
    echo -e "${yellow}📌 启动中优先级服务...${reset}"
    ./yesdev/start.sh &
    sleep 2
    ./browser/start.sh &
    sleep 2
    
    echo -e "${yellow}📌 启动低优先级服务...${reset}"
    ./slack/start.sh &
    sleep 2
    
    echo -e "${green}✅ 所有 MCP 服务启动完成${reset}"
    echo -e "${blue}   可以使用 'ps aux | grep mcp' 查看服务运行状态${reset}"
}

# 停止所有 MCP 服务
stop_all() {
    echo -e "${blue}🛑 停止所有 MCP 服务...${reset}"
    
    pkill -f "postgresql-mcp" || true
    pkill -f "docker-mcp" || true
    pkill -f "filesystem-mcp" || true
    pkill -f "github-mcp" || true
    pkill -f "yesdev-mcp" || true
    pkill -f "browser-mcp" || true
    pkill -f "slack-mcp" || true
    
    echo -e "${green}✅ 所有 MCP 服务已停止${reset}"
}

# 查看所有 MCP 服务状态
status_all() {
    echo -e "${blue}📊 查看所有 MCP 服务状态...${reset}"
    
    echo -e "${yellow}\nPostgreSQL MCP Server:${reset}"
    if pgrep -f "postgresql-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nDocker MCP Server:${reset}"
    if pgrep -f "docker-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nFile System MCP Server:${reset}"
    if pgrep -f "filesystem-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nGitHub MCP Server:${reset}"
    if pgrep -f "github-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nYesDev MCP Server:${reset}"
    if pgrep -f "yesdev-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nBrowser MCP for Automation:${reset}"
    if pgrep -f "browser-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${yellow}\nSlack MCP Server:${reset}"
    if pgrep -f "slack-mcp" > /dev/null; then
        echo -e "${green}  ✅ 运行中${reset}"
    else
        echo -e "${red}  ❌ 未运行${reset}"
    fi
    
    echo -e "${blue}\n📋 提示：可以使用 './manage-mcp.sh start' 启动所有服务，'./manage-mcp.sh stop' 停止所有服务${reset}"
}

# 显示帮助信息
show_help() {
    echo -e "${blue}📚 MCP 服务管理脚本帮助${reset}"
    echo -e "${yellow}  ./manage-mcp.sh start   - 启动所有 MCP 服务${reset}"
    echo -e "${yellow}  ./manage-mcp.sh stop    - 停止所有 MCP 服务${reset}"
    echo -e "${yellow}  ./manage-mcp.sh status  - 查看所有 MCP 服务状态${reset}"
    echo -e "${yellow}  ./manage-mcp.sh help    - 显示帮助信息${reset}"
}

# 主函数
main() {
    case "$1" in
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        status)
            status_all
            ;;
        help | *)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"
EOF
    
    chmod +x mcp/manage-mcp.sh
    
    echo -e "${green}✅ MCP 服务管理脚本创建完成${reset}"
    echo -e "${blue}   使用命令: ./mcp/manage-mcp.sh help 查看使用帮助${reset}"
}

# 显示安装完成信息
show_completion_info() {
    echo -e "${blue}\n🎉 MCP 服务器自动安装脚本执行完成！${reset}"
    echo -e "${green}\n✅ 已安装的 MCP 服务器：${reset}"
    echo -e "${yellow}   1. PostgreSQL MCP Server（高优先级）${reset}"
    echo -e "${yellow}   2. Docker MCP Server（高优先级）${reset}"
    echo -e "${yellow}   3. File System MCP Server（中高优先级）${reset}"
    echo -e "${yellow}   4. GitHub MCP Server（中高优先级）${reset}"
    echo -e "${yellow}   5. YesDev MCP Server（中优先级）${reset}"
    echo -e "${yellow}   6. Browser MCP for Automation（中优先级）${reset}"
    echo -e "${yellow}   7. Slack MCP Server（低优先级）${reset}"
    
    echo -e "${blue}\n📋 重要配置说明：${reset}"
    echo -e "${yellow}   - 请配置 GitHub MCP Server 的 API Token 和组织信息${reset}"
    echo -e "${yellow}   - 请配置 YesDev MCP Server 的 API Key 和项目 ID${reset}"
    echo -e "${yellow}   - 请配置 Slack MCP Server 的 Token 和密钥信息${reset}"
    
    echo -e "${blue}\n🚀 启动 MCP 服务：${reset}"
    echo -e "${yellow}   cd mcp && ./manage-mcp.sh start${reset}"
    
    echo -e "${blue}\n📊 查看 MCP 服务状态：${reset}"
    echo -e "${yellow}   cd mcp && ./manage-mcp.sh status${reset}"
    
    echo -e "${blue}\n🛑 停止 MCP 服务：${reset}"
    echo -e "${yellow}   cd mcp && ./manage-mcp.sh stop${reset}"
    
    echo -e "${green}\n请根据项目需求调整 MCP 服务器配置，祝您使用愉快！${reset}\n"
}

# 主函数
main() {
    echo -e "${blue}🚀 开始安装 MCP 服务器...${reset}"
    
    check_requirements
    
    # 按优先级顺序安装 MCP 服务器
    install_postgresql_mcp
    install_docker_mcp
    install_filesystem_mcp
    install_github_mcp
    install_yesdev_mcp
    install_browser_mcp
    install_slack_mcp
    
    # 创建 MCP 服务管理脚本
    create_mcp_manager
    
    # 显示安装完成信息
    show_completion_info
}

# 运行主函数
main "$@"