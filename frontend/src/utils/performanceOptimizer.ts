// 前端性能优化工具
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private imageObserver: IntersectionObserver | null = null;
  private cache = new Map<string, any>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // 图片懒加载
  initLazyLoading(): void {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            this.imageObserver?.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // 观察所有懒加载图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.imageObserver?.observe(img));
  }

  // 预加载关键资源
  preloadResources(): void {
    const criticalResources = [
      { rel: 'preload', href: '/api/products', as: 'fetch' },
      { rel: 'preload', href: '/static/fonts/main.woff2', as: 'font', type: 'font/woff2' },
      { rel: 'preload', href: '/static/css/main.css', as: 'style' },
      { rel: 'dns-prefetch', href: 'https://api.example.com' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      Object.assign(link, resource);
      document.head.appendChild(link);
    });
  }

  // 代码分割和动态导入
  async loadComponent(componentPath: string): Promise<any> {
    if (this.cache.has(componentPath)) {
      return this.cache.get(componentPath);
    }

    try {
      const module = await import(componentPath);
      this.cache.set(componentPath, module);
      return module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  }

  // 防抖函数
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 节流函数
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // 性能监控
  monitorPerformance(): void {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpTime: navigation.connectEnd - navigation.connectStart,
        responseTime: navigation.responseEnd - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };

      console.log('Performance Metrics:', metrics);
      
      // 发送性能数据到监控系统
      this.sendPerformanceData(metrics);
    });
  }

  // 发送性能数据
  private sendPerformanceData(metrics: any): void {
    // 这里可以发送到监控系统
    console.log('Sending performance data:', metrics);
  }

  // 优化滚动性能
  optimizeScroll(): void {
    let ticking = false;
    
    const updateScroll = () => {
      // 处理滚动事件
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // 内存管理
  cleanupMemory(): void {
    // 清理不需要的缓存
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      const toDelete = entries.slice(0, 50); // 删除前50个
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  // 初始化所有优化
  init(): void {
    this.initLazyLoading();
    this.preloadResources();
    this.monitorPerformance();
    this.optimizeScroll();
    
    // 定期清理内存
    setInterval(() => this.cleanupMemory(), 60000); // 每分钟清理一次
  }
}

// 导出单例实例
export const performanceOptimizer = PerformanceOptimizer.getInstance(); 