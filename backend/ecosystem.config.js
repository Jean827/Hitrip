module.exports = {
  apps: [{
    name: 'hainan-tourism-api',
    script: './src/index.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/hainan-tourism/err.log',
    out_file: '/var/log/hainan-tourism/out.log',
    log_file: '/var/log/hainan-tourism/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
}; 