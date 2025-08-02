import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 性能优化配置
    target: 'es2015', // 支持更多浏览器
    minify: 'terser', // 使用terser进行代码压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
    rollupOptions: {
      output: {
        // 代码分割配置
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          charts: ['recharts', 'echarts'],
          utils: ['lodash', 'dayjs'],
        },
        // 文件名配置
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 构建优化
    chunkSizeWarningLimit: 1000, // 块大小警告限制
    sourcemap: false, // 生产环境不生成sourcemap
  },
  server: {
    // 开发服务器配置
    port: 3000,
    host: true,
    open: true,
    cors: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      'lodash',
      'dayjs',
      'recharts',
    ],
  },
  // CSS配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // 环境变量配置
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
}) 